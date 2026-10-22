package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "utilisateur")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "mot_de_passe_hash", length = 255)
    private String motDePasseHash;

    @Column(name = "mot_de_passe_supprime_par_liaison_google", nullable = false)
    private boolean motDePasseSupprimeParLiaisonGoogle = false;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompteExterne> comptesExternes = new ArrayList<>();

    @OneToOne(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
    private Tirelire tirelire;

    public Utilisateur() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasseHash() {
        return motDePasseHash;
    }

    public void setMotDePasseHash(String motDePasseHash) {
        this.motDePasseHash = motDePasseHash;
    }

    public boolean isMotDePasseSupprimeParLiaisonGoogle() {
        return motDePasseSupprimeParLiaisonGoogle;
    }

    public void setMotDePasseSupprimeParLiaisonGoogle(boolean motDePasseSupprimeParLiaisonGoogle) {
        this.motDePasseSupprimeParLiaisonGoogle = motDePasseSupprimeParLiaisonGoogle;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }

    public List<CompteExterne> getComptesExternes() {
        return comptesExternes;
    }

    public void setComptesExternes(List<CompteExterne> comptesExternes) {
        this.comptesExternes = comptesExternes;
    }

    public Tirelire getTirelire() {
        return tirelire;
    }

    public void setTirelire(Tirelire tirelire) {
        this.tirelire = tirelire;
    }

    public boolean aMotDePasse() {
        return motDePasseHash != null && !motDePasseHash.isBlank();
    }
}
