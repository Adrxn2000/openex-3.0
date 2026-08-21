package com.openex.controller

import com.openex.service.AuthService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class RegisterRequest(val username: String, val email: String, val password: String)
data class AuthRequest(val username: String, val password: String)
data class AuthResponse(val token: String)

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): AuthResponse =
        AuthResponse(authService.register(request.username, request.email, request.password))

    @PostMapping("/login")
    fun login(@RequestBody request: AuthRequest): AuthResponse =
        AuthResponse(authService.login(request.username, request.password))
}