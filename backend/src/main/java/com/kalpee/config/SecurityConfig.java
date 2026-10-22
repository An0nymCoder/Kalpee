package com.kalpee.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.ErreurResponseDto;
import com.kalpee.security.JwtAuthenticationFilter;
import com.kalpee.security.OAuth2LoginSuccessHandler;
import com.kalpee.security.OidcAuthenticationFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            OidcAuthenticationFilter oidcAuthenticationFilter,
            OAuth2LoginSuccessHandler oauth2LoginSuccessHandler,
            ClientRegistrationRepository clientRegistrationRepository,
            ObjectMapper objectMapper,
            @Value("${kalpee.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${kalpee.csrf.enabled:true}") boolean csrfEnabled
    ) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource(frontendUrl)));

        if (csrfEnabled) {
            CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
            CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
            requestHandler.setCsrfRequestAttributeName(null);
            http.csrf(csrf -> csrf
                    .csrfTokenRepository(tokenRepository)
                    .csrfTokenRequestHandler(requestHandler)
                    .ignoringRequestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout")
            );
            http.addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class);
        } else {
            http.csrf(csrf -> csrf.disable());
        }

        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/logout",
                        "/api/oauth2/**",
                        "/api/login/oauth2/**",
                        "/api/v3/api-docs/**",
                        "/api/swagger-ui/**",
                        "/api/swagger-ui.html"
                ).permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
        );

        OAuth2AuthorizationRequestResolver pkceResolver = createPkceResolver(clientRegistrationRepository);
        http.oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint -> endpoint
                        .baseUri("/api/oauth2/authorization")
                        .authorizationRequestResolver(pkceResolver)
                )
                .redirectionEndpoint(endpoint -> endpoint
                        .baseUri("/api/login/oauth2/code/*")
                )
                .successHandler(oauth2LoginSuccessHandler)
                .failureHandler((request, response, exception) ->
                        response.sendRedirect(frontendUrl + "/login?error=google_auth_failed")
                )
        );

        http.exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    ErreurResponseDto body = new ErreurResponseDto(
                            CodeErreur.UNAUTHENTICATED.name(),
                            "Authentification requise.",
                            Collections.emptyMap()
                    );
                    objectMapper.writeValue(response.getWriter(), body);
                })
        );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(oidcAuthenticationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    private OAuth2AuthorizationRequestResolver createPkceResolver(ClientRegistrationRepository repo) {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(repo, "/api/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
        return resolver;
    }

    private CorsConfigurationSource corsConfigurationSource(String frontendUrl) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                frontendUrl,
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://10.*:*",
                "http://192.168.*:*",
                "http://172.*:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
        ) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}
