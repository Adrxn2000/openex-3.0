package com.openex.controller

import com.openex.service.JwtService
import com.openex.service.WalletService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty

data class DepositRequest @JsonCreator constructor(
    @JsonProperty("amount") val amount: BigDecimal)
data class BalanceResponse(val currency: String, val balance: BigDecimal)

@RestController
@RequestMapping("/api/wallets")
class WalletController(
    private val jwtService: JwtService,
    private val walletService: WalletService
) {
    @PostMapping("/deposit")
    fun deposit(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: DepositRequest
    ): BalanceResponse {
        val token = authHeader.removePrefix("Bearer ").trim()
        val username = jwtService.extractUsername(token)
        val newBalance = walletService.deposit(username, request.amount)
        return BalanceResponse(currency = "ZAR", balance = newBalance)
    }

    @GetMapping("/balance")
    fun getBalance(@RequestHeader("Authorization") authHeader: String): BalanceResponse {
        val token = authHeader.removePrefix("Bearer ").trim()
        val username = jwtService.extractUsername(token)
        val balance = walletService.getBalance(username)
        return BalanceResponse(currency = "ZAR", balance = balance)
    }

    @GetMapping("/balances")
    fun getAllBalances(@RequestHeader("Authorization") authHeader: String): Map<String, BigDecimal> {
        val token = authHeader.removePrefix("Bearer ").trim()
        val username = jwtService.extractUsername(token)
        return walletService.getAllBalances(username)
    }
}