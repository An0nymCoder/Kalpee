package com.kalpee.security;

import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private record AttemptRecord(int count, Instant lockedUntil) {
    }

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public void checkNotLocked(String email) {
        String key = normalizeKey(email);
        AttemptRecord record = attempts.get(key);
        if (record != null && record.lockedUntil() != null) {
            if (Instant.now().isBefore(record.lockedUntil())) {
                throw new KalpeeException(
                        CodeErreur.TOO_MANY_ATTEMPTS,
                        "Trop de tentatives de connexion échouées. Veuillez réessayer dans quelques minutes."
                );
            } else {
                attempts.remove(key);
            }
        }
    }

    public void recordFailedAttempt(String email) {
        String key = normalizeKey(email);
        attempts.compute(key, (k, existing) -> {
            int nextCount = (existing == null || (existing.lockedUntil() != null && Instant.now().isAfter(existing.lockedUntil())))
                    ? 1
                    : existing.count() + 1;
            Instant lockedUntil = nextCount >= MAX_ATTEMPTS ? Instant.now().plus(LOCK_DURATION) : null;
            return new AttemptRecord(nextCount, lockedUntil);
        });
    }

    public void resetAttempts(String email) {
        attempts.remove(normalizeKey(email));
    }

    public void clearAll() {
        attempts.clear();
    }

    private String normalizeKey(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
