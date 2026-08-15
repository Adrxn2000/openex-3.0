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
        val FAUCET_ACCOUNT_ID: UUID = UUID.fromString("00000000-0000-0000-0000-00000000000f")
    }

    fun deposit(username: String, amount: BigDecimal): BigDecimal {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Unknown user")
        val account = accountRepository.findByUserIdAndCurrency(user.id, "USD")
            ?: throw IllegalStateException("No USD wallet account found for user")
        ledgerService.transfer(FAUCET_ACCOUNT_ID, account.id, amount)
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