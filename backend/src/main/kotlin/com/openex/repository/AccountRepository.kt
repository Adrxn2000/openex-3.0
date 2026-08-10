package com.openex.repository

import com.openex.domain.Account
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AccountRepository : JpaRepository<Account, UUID> {
    fun findByUserId(userId: UUID): Account?
    fun findAllByUserId(userId: UUID): List<Account>
    fun findByUserIdAndCurrency(userId: UUID, currency: String): Account?
}