package com.openex.service

import com.openex.domain.Account
import com.openex.domain.EntryDirection
import com.openex.domain.User
import com.openex.repository.AccountRepository
import com.openex.repository.LedgerEntryRepository
import com.openex.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import java.math.BigDecimal
import java.util.UUID

@SpringBootTest
class LedgerServiceTest {

    @Autowired
    lateinit var ledgerService: LedgerService

    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var accountRepository: AccountRepository

    @Autowired
    lateinit var ledgerEntryRepository: LedgerEntryRepository

    private fun newAccount(): Account {
        val user = userRepository.save(
            User(
                id = UUID.randomUUID(),
                username = "test-${UUID.randomUUID()}",
                passwordHash = "not-a-real-hash"
            )
        )
        return accountRepository.save(
            Account(id = UUID.randomUUID(), userId = user.id, currency = "ZAR")
        )
    }

    @Test
    fun `ledger entries always sum to zero for a balanced transfer`() {
        val accountA = newAccount()
        val accountB = newAccount()

        val transactionId = ledgerService.transfer(accountA.id, accountB.id, BigDecimal("100.00"))

        val entries = ledgerEntryRepository.findByTransactionId(transactionId)
        assertEquals(2, entries.size, "a transfer should write exactly one debit and one credit leg")

        val net = entries.fold(BigDecimal.ZERO) { runningTotal, entry ->
            when (entry.direction) {
                EntryDirection.DEBIT -> runningTotal.subtract(entry.amount)
                EntryDirection.CREDIT -> runningTotal.add(entry.amount)
            }
        }
        assertEquals(0, net.compareTo(BigDecimal.ZERO), "debit and credit legs must net to exactly zero")
    }

    @Test
    fun `balance is correctly derived from summed ledger entries`() {
        val accountA = newAccount()
        val accountB = newAccount()

        ledgerService.transfer(accountA.id, accountB.id, BigDecimal("100.00"))
        ledgerService.transfer(accountA.id, accountB.id, BigDecimal("25.00"))

        assertEquals(0, ledgerService.balanceOf(accountA.id).compareTo(BigDecimal("-125.00")))
        assertEquals(0, ledgerService.balanceOf(accountB.id).compareTo(BigDecimal("125.00")))
    }

    @Test
    fun `transaction rolls back entirely when one leg violates a constraint`() {
        val accountA = newAccount()
        val nonExistentAccountId = UUID.randomUUID()

        val countBefore = ledgerEntryRepository.count()

        assertThrows(DataIntegrityViolationException::class.java) {
            ledgerService.transfer(accountA.id, nonExistentAccountId, BigDecimal("50.00"))
        }

        val countAfter = ledgerEntryRepository.count()
        assertEquals(countBefore, countAfter, "no ledger entries should persist when either leg of a transfer fails")
    }

    @Test
    fun `transfer rejects a non-positive amount before touching the database`() {
        val accountA = newAccount()
        val accountB = newAccount()

        assertThrows(IllegalArgumentException::class.java) {
            ledgerService.transfer(accountA.id, accountB.id, BigDecimal.ZERO)
        }
    }
}