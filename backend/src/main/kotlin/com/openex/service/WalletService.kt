package com.openex.service

import com.openex.repository.AccountRepository
import com.openex.repository.UserRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class WalletService(
    private val userRepository: UserRepository,
    private val accountRepository: AccountRepository,
    private val ledgerService: LedgerService
) {
    companion object {
        val FAUCET_USER_ID: UUID = UUID.fromString("00000000-0000-0000-0000-000000000001")
    }

    fun deposit(username: String, amount: BigDecimal, currency: String = "USD"): BigDecimal {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Unknown user")
        val account = accountRepository.findByUserIdAndCurrency(user.id, currency)
            ?: throw IllegalStateException("No $currency wallet account found for user")
        val faucetAccount = accountRepository.findByUserIdAndCurrency(FAUCET_USER_ID, currency)
            ?: throw IllegalStateException("No faucet account configured for currency $currency")
        ledgerService.transfer(faucetAccount.id, account.id, amount)
        return ledgerService.balanceOf(account.id)
    }

    fun getBalance(username: String): BigDecimal {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Unknown user")
        val account = accountRepository.findByUserIdAndCurrency(user.id, "USD")
            ?: throw IllegalStateException("No USD wallet account found for user")
        return ledgerService.balanceOf(account.id)
    }

    fun getAllBalances(username: String): Map<String, BigDecimal> {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Unknown user")
        return accountRepository.findAllByUserId(user.id)
            .associate { it.currency to ledgerService.balanceOf(it.id) }
    }
}