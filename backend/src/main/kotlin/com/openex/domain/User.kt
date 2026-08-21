package com.openex.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID


@Entity
@Table(name = "users")

data class User(
    @Id
    val id: UUID,
    @Column(nullable = false, unique = true)
    val username: String,
    @Column(nullable = true, unique = true)
    val email: String? = null,
    @Column(name = "password_hash", nullable = false)
    val passwordHash: String,
    @Column(name = "created_at", insertable = false, updatable = false)
    val createdAt: LocalDateTime? = null
)