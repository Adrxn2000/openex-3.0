package com.openex.service

import com.openex.domain.Order
import com.openex.domain.OrderSide
import com.openex.domain.OrderStatus
import com.openex.domain.OrderType
import com.openex.repository.AccountRepository
import com.openex.repository.OrderRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val accountRepository: AccountRepository,
    private val ledgerService: LedgerService,
    private val broadcastService: OrderBookBroadcastService
) {

    @Transactional
    fun placeOrder(
        userId: UUID,
        side: OrderSide,
        orderType: OrderType,
        price: BigDecimal?,
        quantity: BigDecimal,
        idempotencyKey: UUID
    ): Order {
        // Idempotency check FIRST: if this exact user already submitted this
        // exact key, return the existing order instead of creating another.
        orderRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)?.let { return it }

        require(quantity > BigDecimal.ZERO) { "Quantity must be positive" }
        if (orderType == OrderType.LIMIT) {
            require(price != null && price > BigDecimal.ZERO) { "Limit orders require a positive price" }
        }

        val order = orderRepository.save(
            Order(
                id = UUID.randomUUID(),
                userId = userId,
                side = side,
                orderType = orderType,
                price = price,
                quantity = quantity,
                remainingQty = quantity,
                status = OrderStatus.OPEN,
                idempotencyKey = idempotencyKey
            )
        )

        matchOrder(order)
        broadcastOrderBook()

        return order
    }

    private fun matchOrder(incoming: Order) {
        // A BUY matches against existing SELL orders, and vice versa.
        // Sells are checked cheapest-first; buys are checked highest-first —
        // this is "price-time priority" from the brief.
        val opposite = when (incoming.side) {
            OrderSide.BUY -> orderRepository.findByStatusAndSideOrderByPriceAsc(OrderStatus.OPEN, OrderSide.SELL)
            OrderSide.SELL -> orderRepository.findByStatusAndSideOrderByPriceDesc(OrderStatus.OPEN, OrderSide.BUY)
        }

        for (candidate in opposite) {
            if (incoming.remainingQty <= BigDecimal.ZERO) break
            if (candidate.id == incoming.id) continue
            if (candidate.userId == incoming.userId) continue
            if (!pricesCross(incoming, candidate)) continue

            val fillQty = minOf(incoming.remainingQty, candidate.remainingQty)
            val fillPrice = candidate.price ?: incoming.price ?: continue

            executeTrade(incoming, candidate, fillQty, fillPrice)
        }
    }

    private fun pricesCross(incoming: Order, candidate: Order): Boolean {
        // Market orders always cross — they accept whatever price is available.
        if (incoming.orderType == OrderType.MARKET) return true
        val incomingPrice = incoming.price ?: return false
        val candidatePrice = candidate.price ?: return true

        return when (incoming.side) {
            OrderSide.BUY -> incomingPrice >= candidatePrice
            OrderSide.SELL -> incomingPrice <= candidatePrice
        }
    }

    private fun executeTrade(incoming: Order, candidate: Order, fillQty: BigDecimal, fillPrice: BigDecimal) {
        val buyOrder = if (incoming.side == OrderSide.BUY) incoming else candidate
        val sellOrder = if (incoming.side == OrderSide.SELL) incoming else candidate

       val buyerAccount = accountRepository.findByUserIdAndCurrency(buyOrder.userId, "USD")
            ?: throw IllegalStateException("No USD wallet for buyer")
        val sellerAccount = accountRepository.findByUserIdAndCurrency(sellOrder.userId, "USD")
            ?: throw IllegalStateException("No USD wallet for seller")
        val totalCost = fillPrice.multiply(fillQty)
        // Simulated settlement: buyer's USD moves to the seller.
        // (A real exchange would also move the traded asset the other way —
        // that's out of scope for this simplified simulation.)
        ledgerService.transfer(buyerAccount.id, sellerAccount.id, totalCost)

        incoming.remainingQty = incoming.remainingQty.subtract(fillQty)
        candidate.remainingQty = candidate.remainingQty.subtract(fillQty)
        incoming.status = statusFor(incoming.remainingQty)
        candidate.status = statusFor(candidate.remainingQty)

        orderRepository.save(incoming)
        orderRepository.save(candidate)
    }

    private fun statusFor(remainingQty: BigDecimal): OrderStatus =
        if (remainingQty <= BigDecimal.ZERO) OrderStatus.FILLED else OrderStatus.PARTIALLY_FILLED

    private fun broadcastOrderBook() {
        val bestBid = orderRepository.findByStatusAndSideOrderByPriceDesc(OrderStatus.OPEN, OrderSide.BUY)
            .firstOrNull()?.price ?: BigDecimal.ZERO
        val bestAsk = orderRepository.findByStatusAndSideOrderByPriceAsc(OrderStatus.OPEN, OrderSide.SELL)
            .firstOrNull()?.price ?: BigDecimal.ZERO

        broadcastService.broadcast(com.openex.domain.OrderBookSnapshot(bestBid = bestBid, bestAsk = bestAsk))
    }
}