package com.kalpee.security;

import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof KalpeePrincipal principal) {
            return principal.id();
        }
        throw new KalpeeException(CodeErreur.UNAUTHENTICATED, "Authentification requise.");
    }
}
