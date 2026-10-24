package com.kalpee.security;

import com.kalpee.entity.RoleUtilisateur;
import com.kalpee.entity.Utilisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationSeconds;
    private final String cookieName;
    private final boolean cookieSecure;

    public JwtService(
            @Value("${kalpee.jwt.secret}") String secret,
            @Value("${kalpee.jwt.expiration-seconds:86400}") long expirationSeconds,
            @Value("${kalpee.jwt.cookie-name:KALPEE_SESSION}") String cookieName,
            @Value("${kalpee.jwt.cookie-secure:false}") boolean cookieSecure
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationSeconds = expirationSeconds;
        this.cookieName = cookieName;
        this.cookieSecure = cookieSecure;
    }

    public String generateToken(Utilisateur utilisateur) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(expirationSeconds);
        RoleUtilisateur role = utilisateur.getRole() != null ? utilisateur.getRole() : RoleUtilisateur.USER;
        return Jwts.builder()
                .subject(String.valueOf(utilisateur.getId()))
                .claim("email", utilisateur.getEmail())
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public Optional<KalpeePrincipal> parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Long userId = Long.parseLong(claims.getSubject());
            String email = claims.get("email", String.class);
            String roleStr = claims.get("role", String.class);
            RoleUtilisateur role = RoleUtilisateur.USER;
            if (roleStr != null) {
                try {
                    role = RoleUtilisateur.valueOf(roleStr);
                } catch (IllegalArgumentException ignored) {
                }
            }
            return Optional.of(new KalpeePrincipal(userId, email, role));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public ResponseCookie createSessionCookie(Utilisateur utilisateur) {
        String jwt = generateToken(utilisateur);
        return ResponseCookie.from(cookieName, jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofSeconds(expirationSeconds))
                .build();
    }

    public ResponseCookie createLogoutCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }

    public String getCookieName() {
        return cookieName;
    }
}
