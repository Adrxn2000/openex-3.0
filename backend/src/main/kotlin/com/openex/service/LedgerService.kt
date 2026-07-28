package com.openex.service

import com.openex.domain.EntryDirection
import com.openex.domain.LedgerEntry
import com.openex.repository.LedgerEntryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class LedgerService(
    private val ledgerEntryRepository: LedgerEntryRepository
) {

    @Transactional
    fun transfer(fromAccountId: UUID, toAccountId: UUID, amount: BigDecimal): UUID {
        require(amount > BigDecimal.ZERO) { "Transfer amount must be positive" }
        require(fromAccountId != toAccountId) { "Cannot transfer to the same account" }

        val transactionId = UUID.randomUUID()

        val debit = LedgerEntry(
            id = UUID.randomUUID(),
            transactionId = transactionId,
            accountId = fromAccountId,
            amount = amount,
            direction = EntryDirection.DEBIT
        )
        val credit = LedgerEntry(
            id = UUID.randomUUID(),
            transactionId = transactionId,
            accountId = toAccountId,
            amount = amount,
            direction = EntryDirection.CREDIT
        )

        ledgerEntryRepository.save(debit)
        ledgerEntryRepository.save(credit)
        ledgerEntryRepository.flush()

        return transactionId
    }

    fun balanceOf(accountId: UUID): BigDecimal =
        ledgerEntryRepository.findByAccountId(accountId).fold(BigDecimal.ZERO) { runningTotal, entry ->
            when (entry.direction) {
                EntryDirection.CREDIT -> runningTotal.add(entry.amount)
                EntryDirection.DEBIT -> runningTotal.subtract(entry.amount)
            }
        }
}