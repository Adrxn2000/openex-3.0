package com.openex.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "accounts")
data class Account(
    @Id
    val id: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(nullable = false)
    val currency: String,

    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null
)