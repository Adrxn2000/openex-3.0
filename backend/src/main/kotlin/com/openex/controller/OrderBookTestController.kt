package com.openex.controller

import com.openex.domain.OrderBookSnapshot
import com.openex.service.OrderBookBroadcastService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal

data class TestBroadcastRequest(val bestBid: BigDecimal, val bestAsk: BigDecimal)

// TEMPORARY: lets us manually trigger a broadcast to prove the WebSocket
// pipeline works end-to-end, before the real matching engine exists to
// trigger it automatically. Safe to delete once that's built.
@RestController
@RequestMapping("/api/test")
class OrderBookTestController(
    private val broadcastService: OrderBookBroadcastService
) {

    @PostMapping("/broadcast")
    fun triggerBroadcast(@RequestBody request: TestBroadcastRequest): String {
        broadcastService.broadcast(OrderBookSnapshot(bestBid = request.bestBid, bestAsk = request.bestAsk))
        return "Broadcast sent"
    }
}