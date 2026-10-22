package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "photo_article")
public class PhotoArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false, unique = true)
    private Article article;

    @Column(nullable = false, length = 500)
    private String chemin;

    @Column(name = "type_mime", nullable = false, length = 100)
    private String typeMime;

    @Column(nullable = false)
    private Long taille;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();

    public PhotoArticle() {
    }

    public PhotoArticle(Article article, String chemin, String typeMime, Long taille) {
        this.article = article;
        this.chemin = chemin;
        this.typeMime = typeMime;
        this.taille = taille;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }

    public String getChemin() {
        return chemin;
    }

    public void setChemin(String chemin) {
        this.chemin = chemin;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public void setTypeMime(String typeMime) {
        this.typeMime = typeMime;
    }

    public Long getTaille() {
        return taille;
    }

    public void setTaille(Long taille) {
        this.taille = taille;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }
}
