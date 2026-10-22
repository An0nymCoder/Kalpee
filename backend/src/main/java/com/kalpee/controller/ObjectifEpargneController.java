package com.kalpee.controller;

import com.kalpee.dto.ObjectifDto;
import com.kalpee.dto.ObjectifRequestDto;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.ObjectifEpargneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objectifs")
public class ObjectifEpargneController {

    private final ObjectifEpargneService objectifService;

    public ObjectifEpargneController(ObjectifEpargneService objectifService) {
        this.objectifService = objectifService;
    }

    @GetMapping
    public ResponseEntity<List<ObjectifDto>> listerObjectifs() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(objectifService.listerObjectifs(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObjectifDto> obtenirObjectif(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(objectifService.obtenirObjectif(userId, id));
    }

    @PostMapping
    public ResponseEntity<ObjectifDto> creerObjectif(@Valid @RequestBody ObjectifRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(objectifService.creerObjectif(userId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObjectifDto> modifierObjectif(
            @PathVariable Long id,
            @Valid @RequestBody ObjectifRequestDto dto
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(objectifService.modifierObjectif(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerObjectif(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        objectifService.supprimerObjectif(userId, id);
        return ResponseEntity.noContent().build();
    }
}
