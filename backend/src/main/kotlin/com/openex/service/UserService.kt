package com.openex.service

import com.openex.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun getUserIdByUsername(username: String): UUID =
        userRepository.findByUsername(username)?.id
            ?: throw IllegalArgumentException("Unknown user")
}