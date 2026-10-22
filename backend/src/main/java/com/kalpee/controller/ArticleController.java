package com.kalpee.controller;

import com.kalpee.dto.*;
import com.kalpee.security.SecurityUtils;
import com.kalpee.service.ArticleService;
import com.kalpee.service.StockagePhoto;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/achats/{achatId}/articles")
    public ResponseEntity<List<ArticleDto>> listerArticles(@PathVariable Long achatId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(articleService.listerArticles(userId, achatId));
    }

    @PostMapping("/achats/{achatId}/articles")
    public ResponseEntity<ArticleDto> ajouterArticle(
            @PathVariable Long achatId,
            @Valid @RequestBody ArticleRequestDto dto
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(articleService.ajouterArticle(userId, achatId, dto));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<ArticleDto> modifierArticle(
            @PathVariable Long id,
            @Valid @RequestBody ArticleRequestDto dto
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(articleService.modifierArticle(userId, id, dto));
    }

    @PatchMapping("/articles/{id}/statut")
    public ResponseEntity<ArticleStatutResponseDto> changerStatut(
            @PathVariable Long id,
            @Valid @RequestBody ArticleStatutRequestDto dto
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(articleService.changerStatut(userId, id, dto.statut()));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Void> supprimerArticle(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        articleService.supprimerArticle(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/articles/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleDto> uploaderPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(articleService.enregistrerPhoto(userId, id, file));
    }

    @GetMapping("/articles/{id}/photo")
    public ResponseEntity<byte[]> obtenirPhoto(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        StockagePhoto.ContenuPhoto contenu = articleService.lirePhoto(userId, id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contenu.typeMime())
                .body(contenu.donnees());
    }

    @DeleteMapping("/articles/{id}/photo")
    public ResponseEntity<Void> supprimerPhoto(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        articleService.supprimerPhoto(userId, id);
        return ResponseEntity.noContent().build();
    }
}
