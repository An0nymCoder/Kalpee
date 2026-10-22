package com.kalpee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "transaction_tirelire")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tirelire_id", nullable = false)
    private Tirelire tirelire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeTransaction type;

    @Column(nullable = false)
    private Long montant;

    @Column(nullable = false, length = 300)
    private String motif;

    @Column(name = "date_transaction", nullable = false, updatable = false)
    private Instant date = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objectif_id")
    private ObjectifEpargne objectif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private Article article;

    public Transaction() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tirelire getTirelire() {
        return tirelire;
    }

    public void setTirelire(Tirelire tirelire) {
        this.tirelire = tirelire;
    }

    public TypeTransaction getType() {
        return type;
    }

    public void setType(TypeTransaction type) {
        this.type = type;
    }

    public Long getMontant() {
        return montant;
    }

    public void setMontant(Long montant) {
        this.montant = montant;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public ObjectifEpargne getObjectif() {
        return objectif;
    }

    public void setObjectif(ObjectifEpargne objectif) {
        this.objectif = objectif;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }
}
