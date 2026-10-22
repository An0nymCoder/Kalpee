package com.kalpee.controller;

import com.kalpee.dto.AchatDetailDto;
import com.kalpee.dto.AchatDto;
import com.kalpee.dto.AchatRequestDto;
import com.kalpee.entity.Priorite;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.AchatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achats")
public class AchatController {

    private final AchatService achatService;

    public AchatController(AchatService achatService) {
        this.achatService = achatService;
    }

    @GetMapping
    public ResponseEntity<List<AchatDto>> listerAchats(
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) Priorite priorite
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(achatService.listerAchats(userId, recherche, priorite));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AchatDetailDto> obtenirAchat(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(achatService.obtenirAchat(userId, id));
    }

    @PostMapping
    public ResponseEntity<AchatDto> creerAchat(@Valid @RequestBody AchatRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(achatService.creerAchat(userId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AchatDto> modifierAchat(
            @PathVariable Long id,
            @Valid @RequestBody AchatRequestDto dto
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(achatService.modifierAchat(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerAchat(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        achatService.supprimerAchat(userId, id);
        return ResponseEntity.noContent().build();
    }
}
