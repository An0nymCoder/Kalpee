package com.kalpee.controller;

import com.kalpee.dto.*;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.TirelireService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tirelire")
public class TirelireController {

    private final TirelireService tirelireService;

    public TirelireController(TirelireService tirelireService) {
        this.tirelireService = tirelireService;
    }

    @GetMapping
    public ResponseEntity<TirelireDto> obtenirTirelire() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(tirelireService.obtenirTirelire(userId));
    }

    @PostMapping("/depot")
    public ResponseEntity<TransactionDto> deposer(@Valid @RequestBody DepotRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tirelireService.deposer(userId, dto));
    }

    @PostMapping("/retrait")
    public ResponseEntity<TransactionDto> retirer(@Valid @RequestBody RetraitRequestDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tirelireService.retirer(userId, dto));
    }

    @GetMapping("/transactions")
    public ResponseEntity<PageResponseDto<TransactionDto>> listerTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(tirelireService.listerTransactions(userId, page, size));
    }
}
