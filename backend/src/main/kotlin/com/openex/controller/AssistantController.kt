package com.openex.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.HttpStatusCodeException
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty

data class ChatRequest @JsonCreator constructor(
    @JsonProperty("question") val question: String
)

@RestController
@RequestMapping("/api/assistant")
class AssistantController(
    @Value("\${market-sim.url}") private val marketSimUrl: String,
    @Value("\${market-sim.api-key}") private val marketSimApiKey: String
) {
    private val restTemplate = RestTemplate()

    @PostMapping("/chat")
    fun chat(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: ChatRequest
    ): Map<String, Any> {
        val headers = HttpHeaders()
        headers.set("Content-Type", "application/json")
        headers.set("X-API-Key", marketSimApiKey)
        headers.set("Authorization", authHeader)

        val entity = HttpEntity(mapOf("question" to request.question), headers)

        return try {
            restTemplate.postForObject(
                "$marketSimUrl/api/chat",
                entity,
                Map::class.java
            ) as Map<String, Any>
        } catch (e: HttpStatusCodeException) {
            mapOf("response" to "Assistant unavailable right now: ${e.responseBodyAsString}")
        } catch (e: Exception) {
            mapOf("response" to "Could not reach the AI service. Make sure market-sim is running.")
        }
    }
}