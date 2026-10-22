package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "article")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "achat_id", nullable = false)
    private Achat achat;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer quantite = 1;

    @Column(name = "prix_unitaire", nullable = false)
    private Long prixUnitaire = 0L;

    @Column(length = 200)
    private String magasin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutArticle statut = StatutArticle.A_ACHETER;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();

    @OneToOne(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private PhotoArticle photo;

    public Article() {
    }

    public long calculerTotal() {
        int q = quantite != null ? quantite : 0;
        long p = prixUnitaire != null ? prixUnitaire : 0L;
        return (long) q * p;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Achat getAchat() {
        return achat;
    }

    public void setAchat(Achat achat) {
        this.achat = achat;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public Long getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Long prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }

    public String getMagasin() {
        return magasin;
    }

    public void setMagasin(String magasin) {
        this.magasin = magasin;
    }

    public StatutArticle getStatut() {
        return statut;
    }

    public void setStatut(StatutArticle statut) {
        this.statut = statut;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }

    public PhotoArticle getPhoto() {
        return photo;
    }

    public void setPhoto(PhotoArticle photo) {
        this.photo = photo;
    }
}
