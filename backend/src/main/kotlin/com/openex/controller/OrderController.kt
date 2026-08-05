package com.openex.controller

import com.openex.domain.Order
import com.openex.domain.OrderSide
import com.openex.domain.OrderType
import com.openex.service.JwtService
import com.openex.service.OrderService
import com.openex.service.UserService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.util.UUID

data class PlaceOrderRequest(
    val side: OrderSide,
    val orderType: OrderType,
    val price: BigDecimal?,
    val quantity: BigDecimal
)

@RestController
@RequestMapping("/api/orders")
class OrderController(
    private val jwtService: JwtService,
    private val userService: UserService,
    private val orderService: OrderService
) {

    @PostMapping
    fun placeOrder(
        @RequestHeader("Authorization") authHeader: String,
        @RequestHeader("Idempotency-Key") idempotencyKey: UUID,
        @RequestBody request: PlaceOrderRequest
    ): Order {
        val token = authHeader.removePrefix("Bearer ").trim()
        val username = jwtService.extractUsername(token)
        val userId = userService.getUserIdByUsername(username)

        return orderService.placeOrder(
            userId = userId,
            side = request.side,
            orderType = request.orderType,
            price = request.price,
            quantity = request.quantity,
            idempotencyKey = idempotencyKey
        )
    }
}
