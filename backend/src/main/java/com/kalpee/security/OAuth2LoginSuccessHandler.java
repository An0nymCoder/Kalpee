package com.kalpee.security;

import com.kalpee.entity.FournisseurExterne;
import com.kalpee.exception.KalpeeException;
import com.kalpee.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtService jwtService;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            AuthService authService,
            JwtService jwtService,
            @Value("${kalpee.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            response.sendRedirect(frontendUrl + "/login?error=google_auth_failed");
            return;
        }

        try {
            String sub = oauth2User.getAttribute("sub");
            if (sub == null) {
                sub = oauth2User.getName();
            }
            String email = oauth2User.getAttribute("email");
            Boolean emailVerified = extractEmailVerified(oauth2User.getAttribute("email_verified"));
            String givenName = oauth2User.getAttribute("given_name");
            String familyName = oauth2User.getAttribute("family_name");

            AuthService.OAuth2LoginResult result = authService.processOAuth2Login(
                    FournisseurExterne.GOOGLE,
                    sub,
                    email,
                    emailVerified,
                    givenName,
                    familyName
            );

            ResponseCookie cookie = jwtService.createSessionCookie(result.utilisateur());
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            if (result.motDePasseSupprimeParLiaison()) {
                response.sendRedirect(frontendUrl + "/profil?googleLinked=true");
            } else {
                response.sendRedirect(frontendUrl + "/dashboard");
            }
        } catch (KalpeeException e) {
            response.sendRedirect(frontendUrl + "/login?error=google_email_unverified");
        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/login?error=google_auth_failed");
        }
    }

    public static Boolean extractEmailVerified(Object raw) {
        if (raw instanceof Boolean b) {
            return b;
        }
        if (raw instanceof String s) {
            return Boolean.parseBoolean(s);
        }
        return false;
    }
}
