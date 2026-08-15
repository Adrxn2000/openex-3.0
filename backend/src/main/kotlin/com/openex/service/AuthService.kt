package com.openex.service

import com.openex.domain.Account
import com.openex.domain.User
import com.openex.repository.AccountRepository
import com.openex.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val accountRepository: AccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    /**
     * Creates a new user AND a USD wallet account for them in one
     * transaction, then returns a token so they're immediately logged in.
     */
    @Transactional
    fun register(username: String, rawPassword: String): String {
        require(userRepository.findByUsername(username) == null) { "Username already taken" }

        val user = userRepository.save(
            User(
                id = UUID.randomUUID(),
                username = username,
                passwordHash = passwordEncoder.encode(rawPassword)
            )
        )

       accountRepository.save(
            Account(id = UUID.randomUUID(), userId = user.id, currency = "USD")
        )
        accountRepository.save(
            Account(id = UUID.randomUUID(), userId = user.id, currency = "BTC")
        )
        return jwtService.generateToken(user.username)

        
    }

    /** Checks credentials and returns a fresh token if they're correct. */
    fun login(username: String, rawPassword: String): String {
       val user = userRepository.findByUsername(username)
    ?: throw InvalidCredentialsException("Invalid username or password")

if (!passwordEncoder.matches(rawPassword, user.passwordHash)) {
    throw InvalidCredentialsException("Invalid username or password")
}

        return jwtService.generateToken(user.username)
    }
}