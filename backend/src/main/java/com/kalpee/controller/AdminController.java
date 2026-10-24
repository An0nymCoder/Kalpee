package com.kalpee.controller;

import com.kalpee.dto.AdminDashboardDto;
import com.kalpee.dto.AdminUserDto;
import com.kalpee.dto.UpdateUserRoleRequestDto;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> obtenirDashboardAdmin() {
        return ResponseEntity.ok(adminService.obtenirDashboardAdmin());
    }

    @PatchMapping("/utilisateurs/{id}/role")
    public ResponseEntity<AdminUserDto> changerRoleUtilisateur(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequestDto dto
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(adminService.changerRoleUtilisateur(adminId, id, dto.role()));
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> supprimerUtilisateur(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        adminService.supprimerUtilisateur(adminId, id);
        return ResponseEntity.noContent().build();
    }
}
