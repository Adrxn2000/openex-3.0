package com.openex.service

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) {
    private val signingKey: SecretKey by lazy { Keys.hmacShaKeyFor(secret.toByteArray()) }

    /** Creates a signed token that says "this is [username], valid until [expiry]." */
    fun generateToken(username: String): String {
        val now = Date()
        val expiry = Date(now.time + expirationMs)
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey)
            .compact()
    }

    /** Reads the username back out of a token — but only succeeds if the signature is genuine and not expired. */
    fun extractUsername(token: String): String =
        Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject

    fun isTokenValid(token: String): Boolean =
        try {
            extractUsername(token)
            true
        } catch (e: Exception) {
            false
        }
}