package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "compte_externe", uniqueConstraints = {
        @UniqueConstraint(name = "uk_compte_externe", columnNames = {"fournisseur", "identifiant_externe"})
})
public class CompteExterne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FournisseurExterne fournisseur;

    @Column(name = "identifiant_externe", nullable = false, length = 255)
    private String identifiantExterne;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();

    public CompteExterne() {
    }

    public CompteExterne(Utilisateur utilisateur, FournisseurExterne fournisseur, String identifiantExterne) {
        this.utilisateur = utilisateur;
        this.fournisseur = fournisseur;
        this.identifiantExterne = identifiantExterne;
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

    public FournisseurExterne getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(FournisseurExterne fournisseur) {
        this.fournisseur = fournisseur;
    }

    public String getIdentifiantExterne() {
        return identifiantExterne;
    }

    public void setIdentifiantExterne(String identifiantExterne) {
        this.identifiantExterne = identifiantExterne;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }
}
