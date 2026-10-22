# Cahier des charges — BuyFlow

## 1. Présentation du projet

### 1.1 Nom du projet

**BuyFlow**

### 1.2 Nature du projet

Application web de planification des achats et de gestion d'un budget d'épargne personnel.

### 1.3 Contexte

Pendant certaines périodes, notamment les vacances, les utilisateurs peuvent avoir plusieurs achats à effectuer : vêtements, téléphone, ordinateur, accessoires, équipements, etc.

Lorsque le nombre d'achats augmente, il devient difficile de :

* mémoriser tous les produits souhaités ;
* connaître le montant total nécessaire ;
* conserver des références visuelles ;
* déterminer quels achats sont prioritaires ;
* savoir combien d'argent est disponible ;
* déterminer quels achats peuvent réellement être financés.

BuyFlow a pour objectif de résoudre ce problème en regroupant la **planification des achats** et la **gestion de l'argent disponible** dans une même application.

---

# 2. Problématique

Comment permettre à un utilisateur de centraliser ses achats, d'en connaître le coût, de les prioriser et de gérer progressivement l'argent nécessaire à leur réalisation ?

---

# 3. Objectifs

## 3.1 Objectif général

Développer une application permettant de planifier des achats et de gérer le budget nécessaire à leur réalisation.

## 3.2 Objectifs spécifiques

L'application doit permettre :

* de créer des achats ;
* d'ajouter des articles ;
* d'associer des photos aux articles ;
* de gérer les quantités ;
* de gérer les prix ;
* de calculer automatiquement les totaux ;
* de définir des priorités ;
* de suivre l'état des achats ;
* de gérer une tirelire ;
* de suivre les transactions ;
* de créer des objectifs d'épargne ;
* de comparer le budget disponible aux besoins ;
* de visualiser l'ensemble des informations depuis un dashboard.

---

# 4. Utilisateurs

La première version possède un seul type d'utilisateur :

### Utilisateur

Il peut :

* gérer son compte ;
* gérer ses achats ;
* gérer ses articles ;
* gérer sa tirelire ;
* gérer ses transactions ;
* gérer ses objectifs d'épargne.

Chaque utilisateur possède ses propres données.

---

# 5. Fonctionnalités

## F01 — Inscription

L'utilisateur doit pouvoir créer un compte.

Informations :

* nom ;
* prénom ;
* adresse email ;
* mot de passe.

Contraintes :

* email unique ;
* mot de passe sécurisé ;
* validation des champs obligatoire.

---

## F02 — Connexion

L'utilisateur doit pouvoir se connecter.

Après authentification, il est redirigé vers son dashboard.

---

## F03 — Gestion du profil

L'utilisateur peut :

* consulter son profil ;
* modifier ses informations ;
* modifier son mot de passe.

---

# 6. Module Achat

## F04 — Création d'un achat

L'utilisateur peut créer un achat.

Informations :

* nom ;
* description ;
* priorité ;
* date limite ;
* catégorie ;
* statut.

Exemple :

```text
Nom : Habits
Description : Vêtements pour les vacances
Priorité : URGENT
Date limite : 15 septembre 2026
```

---

## F05 — Modification d'un achat

L'utilisateur peut modifier les informations d'un achat.

---

## F06 — Suppression d'un achat

L'utilisateur peut supprimer un achat.

Une confirmation doit être demandée avant la suppression.

---

## F07 — Consultation d'un achat

L'utilisateur peut consulter :

* les informations de l'achat ;
* les articles ;
* le coût total ;
* la progression ;
* la priorité ;
* le statut.

---

# 7. Module Article

## F08 — Ajout d'un article

Un article appartient obligatoirement à un achat.

Informations :

* nom ;
* description ;
* photo ;
* quantité ;
* prix unitaire ;
* source/magasin ;
* statut.

---

## F09 — Calcul du prix d'un article

Le système calcule :

```text
Total article = Quantité × Prix unitaire
```

Exemple :

```text
3 T-shirts × 5 000 FCFA

= 15 000 FCFA
```

---

## F10 — Calcul du prix d'un achat

Le système additionne automatiquement les articles.

```text
Total achat =
Total article 1
+ Total article 2
+ Total article 3
+ ...
```

---

## F11 — Gestion des statuts

Un article peut être :

* À acheter ;
* Mis de côté ;
* Acheté.

---

# 8. Module Priorité

Chaque achat possède une priorité.

Valeurs :

```text
URGENT
IMPORTANT
NORMAL
FAIBLE
```

L'utilisateur peut modifier la priorité.

L'application doit utiliser cette information dans les recommandations budgétaires.

---

# 9. Module Tirelire

## F12 — Création de la tirelire

Chaque utilisateur possède une tirelire.

La tirelire possède un solde calculé à partir des transactions.

---

## F13 — Dépôt

L'utilisateur peut ajouter de l'argent.

Exemple :

```text
+ 25 000 FCFA
Motif : Épargne mensuelle
```

---

## F14 — Retrait

L'utilisateur peut retirer de l'argent.

Exemple :

```text
- 15 000 FCFA
Motif : Achat d'un jean
```

Le solde ne doit pas devenir négatif sauf si une fonctionnalité de découvert est explicitement ajoutée ultérieurement.

---

## F15 — Historique

L'utilisateur peut consulter l'ensemble de ses transactions.

L'historique affiche :

* montant ;
* type ;
* motif ;
* date.

---

# 10. Module Objectif d'épargne

## F16 — Création d'un objectif

L'utilisateur peut créer un objectif.

Informations :

* nom ;
* montant cible ;
* montant initial ;
* date cible ;
* description.

Exemple :

```text
Objectif : Ordinateur
Montant cible : 300 000 FCFA
Montant épargné : 150 000 FCFA
Date cible : 30/11/2026
```

---

## F17 — Suivi de l'objectif

L'application calcule :

```text
Reste =
Montant cible - Montant épargné
```

et :

```text
Progression =
Montant épargné / Montant cible × 100
```

---

## F18 — Calcul de l'effort d'épargne

Lorsque l'objectif possède une date cible, l'application peut calculer le montant à épargner régulièrement.

Exemple :

```text
Reste : 150 000 FCFA
Durée : 3 mois

Épargne mensuelle recommandée :
50 000 FCFA
```

---

# 11. Module Dashboard

Le dashboard doit présenter :

### Budget

* solde disponible ;
* total déposé ;
* total retiré.

### Achats

* nombre total ;
* montant total ;
* montant déjà dépensé ;
* montant restant.

### Priorités

* achats urgents ;
* achats importants ;
* achats normaux ;
* achats faibles.

### Épargne

* objectifs en cours ;
* progression ;
* montant restant.

---

# 12. Règles métier

### RB01

Un utilisateur ne peut accéder qu'à ses propres données.

### RB02

Un achat appartient à un seul utilisateur.

### RB03

Un article appartient à un seul achat.

### RB04

La quantité d'un article doit être supérieure à zéro.

### RB05

Le prix unitaire doit être supérieur ou égal à zéro.

### RB06

Le montant d'une transaction doit être strictement positif.

### RB07

Le solde de la tirelire est calculé à partir des transactions.

### RB08

Le total d'un achat est calculé à partir de ses articles.

### RB09

La progression d'un achat dépend de ses articles achetés.

### RB10

Un objectif d'épargne ne peut pas avoir un montant cible négatif.

### RB11

Une date cible d'épargne doit être cohérente avec la date de création.

### RB12

Un retrait ne peut pas dépasser le solde disponible.

---

# 13. Contraintes non fonctionnelles

## Sécurité

* authentification obligatoire ;
* autorisation par utilisateur ;
* mots de passe protégés ;
* validation des données ;
* protection des API.

## Performance

Les calculs des totaux doivent être rapides.

Le dashboard doit pouvoir être chargé sans délai important pour un utilisateur possédant plusieurs achats.

## Ergonomie

L'interface doit être :

* simple ;
* responsive ;
* claire ;
* adaptée aux smartphones et ordinateurs ;
* facilement compréhensible.

## Images

Les images doivent :

* être validées ;
* avoir une taille maximale ;
* utiliser des formats autorisés ;
* être stockées de manière sécurisée.

---

# 14. MVP

La première version doit obligatoirement contenir :

### Authentification

* inscription ;
* connexion ;
* déconnexion.

### Achats

* CRUD Achat ;
* CRUD Article ;
* photo ;
* calcul automatique des prix ;
* priorité ;
* statut.

### Tirelire

* solde ;
* dépôt ;
* retrait ;
* historique.

### Dashboard

* total achats ;
* solde ;
* montant restant ;
* priorités ;
* progression.

### Objectifs

* création ;
* montant cible ;
* progression ;
* date cible.

---

# 15. Fonctionnalités futures

Les fonctionnalités suivantes sont hors MVP :

* notifications ;
* rappels ;
* partage d'un achat ;
* multi-utilisateur ;
* comparaison des prix ;
* synchronisation bancaire ;
* recommandations par IA ;
* application mobile ;
* intégration avec des boutiques ;
* scan de produits ;
* reconnaissance d'image ;
* statistiques avancées.

---

# 16. Critères de réussite

Le projet sera considéré comme fonctionnel lorsqu'un utilisateur pourra :

1. créer un compte ;
2. se connecter ;
3. créer un achat ;
4. ajouter plusieurs articles ;
5. ajouter une photo ;
6. définir les quantités et prix ;
7. obtenir automatiquement le total ;
8. définir la priorité ;
9. marquer des articles comme achetés ;
10. consulter la progression ;
11. ajouter de l'argent dans sa tirelire ;
12. effectuer un retrait ;
13. consulter son solde ;
14. créer un objectif d'épargne ;
15. suivre sa progression ;
16. consulter toutes ces informations depuis le dashboard.

---

# 17. Livrables

Le projet devra produire :

* application web ;
* API backend ;
* base de données ;
* documentation technique ;
* documentation utilisateur ;
* diagramme de cas d'utilisation ;
* diagramme de classes ;
* modèle conceptuel de données ;
* modèle logique de données ;
* documentation des API ;
* tests ;
* dépôt Git.

