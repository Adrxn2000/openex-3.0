package com.openex.domain

import java.math.BigDecimal
import java.time.Instant

data class OrderBookSnapshot(
    val bestBid: BigDecimal,
    val bestAsk: BigDecimal,
    val timestamp: Instant = Instant.now()
)