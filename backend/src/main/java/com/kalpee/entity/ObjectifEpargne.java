package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "objectif_epargne")
public class ObjectifEpargne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "montant_cible", nullable = false)
    private Long montantCible;

    @Column(name = "montant_initial", nullable = false)
    private Long montantInitial = 0L;

    @Column(name = "date_cible")
    private LocalDate dateCible;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Categorie categorie = Categorie.AUTRE;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();

    public ObjectifEpargne() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
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

    public Long getMontantCible() {
        return montantCible;
    }

    public void setMontantCible(Long montantCible) {
        this.montantCible = montantCible;
    }

    public Long getMontantInitial() {
        return montantInitial;
    }

    public void setMontantInitial(Long montantInitial) {
        this.montantInitial = montantInitial;
    }

    public LocalDate getDateCible() {
        return dateCible;
    }

    public void setDateCible(LocalDate dateCible) {
        this.dateCible = dateCible;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }
}
