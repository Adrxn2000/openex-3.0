package com.openex.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

enum class OrderSide { BUY, SELL }
enum class OrderType { LIMIT, MARKET }
enum class OrderStatus { OPEN, PARTIALLY_FILLED, FILLED, CANCELLED }

@Entity
@Table(name = "orders")
data class Order(
    @Id
    val id: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val side: OrderSide,

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    val orderType: OrderType,

    @Column
    val price: BigDecimal?,

    @Column(nullable = false)
    val quantity: BigDecimal,

    @Column(name = "remaining_qty", nullable = false)
    var remainingQty: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: OrderStatus,

    @Column(name = "idempotency_key", nullable = false)
    val idempotencyKey: UUID,

    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null
)