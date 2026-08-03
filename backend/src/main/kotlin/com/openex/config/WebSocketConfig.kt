package com.openex.config

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        // Anything sent to a destination starting with /topic gets broadcast
        // to every client currently subscribed to that exact topic.
        registry.enableSimpleBroker("/topic")

        // Messages a client sends TO the server (not used yet, but required
        // by the framework) are prefixed with /app.
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // The actual URL a client connects to, to open the WebSocket in the
        // first place. withSockJS() adds a fallback for browsers/networks
        // that block raw WebSocket connections.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS()
    }
}