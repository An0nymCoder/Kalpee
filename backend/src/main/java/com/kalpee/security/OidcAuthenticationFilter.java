package com.kalpee.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kalpee.entity.FournisseurExterne;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.ErreurResponseDto;
import com.kalpee.exception.KalpeeException;
import com.kalpee.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Permet de provisionner ou relier automatiquement un compte OAuth2/OIDC
 * lorsqu'un jeton OIDC est injecté dans le contexte de sécurité (notamment via oidcLogin() dans les tests d'intégration).
 */
@Component
public class OidcAuthenticationFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public OidcAuthenticationFilter(AuthService authService, JwtService jwtService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            try {
                String sub = oauth2User.getAttribute("sub");
                if (sub == null) {
                    sub = oauth2User.getName();
                }
                String email = oauth2User.getAttribute("email");
                Boolean emailVerified = OAuth2LoginSuccessHandler.extractEmailVerified(
                        oauth2User.getAttribute("email_verified")
                );
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

                KalpeePrincipal principal = new KalpeePrincipal(
                        result.utilisateur().getId(),
                        result.utilisateur().getEmail(),
                        result.utilisateur().getRole()
                );
                String roleAuthority = "ROLE_" + (principal.role() != null ? principal.role().name() : "USER");
                UsernamePasswordAuthenticationToken newAuth = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority(roleAuthority))
                );
                SecurityContextHolder.getContext().setAuthentication(newAuth);

                ResponseCookie cookie = jwtService.createSessionCookie(result.utilisateur());
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            } catch (KalpeeException ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(ex.getCodeErreur().getStatus().value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                ErreurResponseDto body = new ErreurResponseDto(
                        ex.getCodeErreur().name(),
                        ex.getMessage(),
                        ex.getDetails()
                );
                objectMapper.writeValue(response.getWriter(), body);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
