package com.openex.repository

import com.openex.domain.Order
import com.openex.domain.OrderSide
import com.openex.domain.OrderStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface OrderRepository : JpaRepository<Order, UUID> {

    fun findByUserIdAndIdempotencyKey(userId: UUID, idempotencyKey: UUID): Order?

    fun findByStatusAndSideOrderByPriceAsc(status: OrderStatus, side: OrderSide): List<Order>

    fun findByStatusAndSideOrderByPriceDesc(status: OrderStatus, side: OrderSide): List<Order>
}