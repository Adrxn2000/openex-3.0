package com.openex.service

import com.openex.domain.OrderBookSnapshot
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

@Service
class OrderBookBroadcastService(
    private val messagingTemplate: SimpMessagingTemplate
) {
    fun broadcast(snapshot: OrderBookSnapshot) {
        messagingTemplate.convertAndSend("/topic/orderbook", snapshot)
    }
}