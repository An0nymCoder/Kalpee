-- Migration initiale du schéma Kalpee MVP

CREATE TABLE utilisateur (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255),
    mot_de_passe_supprime_par_liaison_google BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compte_externe (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    fournisseur VARCHAR(50) NOT NULL,
    identifiant_externe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_compte_externe UNIQUE (fournisseur, identifiant_externe)
);

CREATE INDEX idx_compte_externe_utilisateur ON compte_externe(utilisateur_id);

CREATE TABLE tirelire (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE REFERENCES utilisateur(id) ON DELETE CASCADE,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achat (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    priorite VARCHAR(30) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    date_limite DATE,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achat_utilisateur ON achat(utilisateur_id);

CREATE TABLE article (
    id BIGSERIAL PRIMARY KEY,
    achat_id BIGINT NOT NULL REFERENCES achat(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    quantite INTEGER NOT NULL CHECK (quantite >= 1),
    prix_unitaire BIGINT NOT NULL CHECK (prix_unitaire >= 0),
    magasin VARCHAR(200),
    statut VARCHAR(30) NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_article_achat ON article(achat_id);

CREATE TABLE photo_article (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL UNIQUE REFERENCES article(id) ON DELETE CASCADE,
    chemin VARCHAR(500) NOT NULL,
    type_mime VARCHAR(100) NOT NULL,
    taille BIGINT NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE objectif_epargne (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    montant_cible BIGINT NOT NULL CHECK (montant_cible > 0),
    montant_initial BIGINT NOT NULL DEFAULT 0 CHECK (montant_initial >= 0 AND montant_initial <= montant_cible),
    date_cible DATE,
    categorie VARCHAR(50) NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_objectif_utilisateur ON objectif_epargne(utilisateur_id);

CREATE TABLE transaction_tirelire (
    id BIGSERIAL PRIMARY KEY,
    tirelire_id BIGINT NOT NULL REFERENCES tirelire(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    montant BIGINT NOT NULL CHECK (montant > 0),
    motif VARCHAR(300) NOT NULL,
    date_transaction TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    objectif_id BIGINT REFERENCES objectif_epargne(id) ON DELETE SET NULL,
    article_id BIGINT REFERENCES article(id) ON DELETE SET NULL
);

CREATE INDEX idx_transaction_tirelire ON transaction_tirelire(tirelire_id);
CREATE INDEX idx_transaction_objectif ON transaction_tirelire(objectif_id);
CREATE INDEX idx_transaction_article ON transaction_tirelire(article_id);
