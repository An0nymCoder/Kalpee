package com.kalpee.controller;

import com.kalpee.dto.*;
import com.kalpee.entity.Utilisateur;
import com.kalpee.security.JwtService;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<UtilisateurDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        Utilisateur utilisateur = authService.inscrire(dto);
        ResponseCookie cookie = jwtService.createSessionCookie(utilisateur);
        UtilisateurDto profil = authService.getProfil(utilisateur.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(profil);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<UtilisateurDto> login(@Valid @RequestBody LoginRequestDto dto) {
        Utilisateur utilisateur = authService.authentifier(dto);
        ResponseCookie cookie = jwtService.createSessionCookie(utilisateur);
        UtilisateurDto profil = authService.getProfil(utilisateur.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(profil);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = jwtService.createLogoutCookie();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UtilisateurDto> me() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(authService.getProfil(userId));
    }

    @GetMapping("/profil")
    public ResponseEntity<UtilisateurDto> getProfil() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(authService.getProfil(userId));
    }

    @PutMapping("/profil")
    public ResponseEntity<UtilisateurDto> updateProfil(@Valid @RequestBody UpdateProfilRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(authService.updateProfil(userId, dto));
    }

    @PutMapping("/profil/mot-de-passe")
    public ResponseEntity<UtilisateurDto> changePassword(@Valid @RequestBody ChangePasswordRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(authService.changePassword(userId, dto));
    }
}
