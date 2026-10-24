-- Ajout du rôle utilisateur (USER, ADMIN)
ALTER TABLE utilisateur
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';
