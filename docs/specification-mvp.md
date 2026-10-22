# Kalpee : spécification de conception du MVP

- Date : 22 octobre 2026
- Statut : rédigée, **en attente de relecture par l'auteur du projet**
- Sources : `ReADME.md` (cahier des charges), `appli.txt` (proposition de design et d'architecture), `Maquettes.zip` (9 captures d'écran)

---

## 1. Objectif

Construire d'abord un MVP utilisable de bout en bout, puis tester le marché avec de vrais utilisateurs (travail séparé, hors de cette spécification).

Kalpee permet à un utilisateur de **planifier ses achats** (achats, articles, photos, priorités) et de **gérer l'argent mis de côté** (tirelire, transactions, objectifs d'épargne), depuis un dashboard unique. La monnaie est le FCFA.

**Critère de réussite du MVP :** les 16 critères de la section 16 du cahier des charges sont satisfaits, de l'inscription à la consultation du dashboard.

## 2. Périmètre

**Inclus (MVP) :**
- Inscription, connexion, déconnexion par email et mot de passe, **connexion avec Google**, gestion du profil et du mot de passe.
- CRUD achats et articles, une photo par article, calculs automatiques, priorités, statuts.
- Tirelire : solde, dépôt, retrait, historique.
- Objectifs d'épargne : création, suivi, progression, épargne mensuelle recommandée.
- Dashboard.

**Exclu du MVP (décisions de l'auteur) :**
- Abonnement et plan Pro, quotas gratuits, paiement Wave et Orange Money. Tout est illimité.
- Connexion avec Apple : elle exige un compte Apple Developer payant (99 USD par an). L'authentification est conçue pour accueillir un second fournisseur plus tard (voir D14).
- Partage WhatsApp d'un achat (le cahier des charges classe le partage hors MVP).
- Notifications, rappels, comparaison de prix, IA, synchronisation bancaire, application mobile native, statistiques avancées.

## 3. Décisions de conception

| # | Sujet | Décision |
|---|---|---|
| D1 | Objectif d'épargne et tirelire | **Liés** : un dépôt peut être étiqueté avec un objectif. Le montant épargné vient des transactions. |
| D2 | Solde et objectifs | **Solde unique** : l'étiquette n'est qu'une marque. Tout retrait est possible tant que le solde total suffit. |
| D3 | Article « Acheté » | L'application **propose** un retrait pré-rempli (montant, motif) que l'utilisateur confirme ou refuse. |
| D4 | Soldes et totaux | **Calculés à la lecture**, jamais stockés (RB07, RB08). |
| D5 | Architecture | SPA React + API REST Spring Boot + PostgreSQL. |
| D6 | Front | React, Vite, React Router, Tailwind CSS, Axios, React Hook Form, Zod, Lucide React. |
| D7 | Abonnement | Hors MVP. Aucune colonne de plan en base. |
| D8 | Statut d'un achat | **Déduit** des articles, jamais saisi. |
| D9 | Progression d'un achat | Calculée en **montant**. |
| D10 | Catégories | Liste fixe, identique pour achats et objectifs : Vêtements, Électronique, Accessoires, Équipement, Autre. |
| D11 | Nom | Le produit s'appelle **Kalpee** (interface, paquet `com.kalpee`, dépôt `kalpee`). « BuyFlow » n'était que le nom de travail des documents de départ. |
| D12 | Connexion Google | Flux OAuth2 « code d'autorisation » géré côté serveur par Spring Security. Une fois l'identité vérifiée, le serveur pose le **même cookie de session** que la connexion par email. |
| D13 | Liaison de comptes | Si l'email Google (certifié par Google) correspond à un compte existant avec mot de passe, les comptes sont **liés automatiquement et l'ancien mot de passe est supprimé** (protège contre la pré-inscription frauduleuse, car l'email n'est pas vérifié à l'inscription classique). L'utilisateur peut définir un nouveau mot de passe dans Mon compte. |
| D14 | Apple | Hors MVP. Le modèle (`CompteExterne`) et le code d'authentification acceptent plusieurs fournisseurs, donc ajouter Apple plus tard ne demande pas de refonte. |

## 4. Architecture

- **Front** : SPA React (Vite). Sidebar sur ordinateur, barre de navigation basse à quatre entrées sur mobile.
- **Back** : API REST Spring Boot, organisée en `config`, `security`, `controller`, `service`, `repository`, `entity`, `dto`, `mapper`, `exception`.
- **Base** : PostgreSQL, schéma géré par des migrations Flyway.
- **Photos** : fichiers sur un volume disque, derrière une interface `StockagePhoto` pour pouvoir passer à un stockage cloud sans toucher au reste.
- **Déploiement local** : `docker-compose` (PostgreSQL et application). Un reverse proxy sert le front et l'API sous **un seul domaine** (`/api` vers Spring Boot).

## 5. Modèle de données

Les montants sont des **entiers FCFA** (BIGINT), sans décimales.

### Entités

- **Utilisateur** : id, nom, prénom, email (unique, en minuscules), mot de passe haché (**optionnel** : vide pour un compte créé uniquement avec Google), date de création.
- **CompteExterne** : id, utilisateur, fournisseur (`GOOGLE`), identifiant chez le fournisseur. Unicité sur (fournisseur, identifiant).
- **Tirelire** : id, utilisateur (relation 1 à 1, créée à l'inscription). Aucun solde stocké.
- **Transaction** : id, tirelire, type (`DEPOT` ou `RETRAIT`), montant (> 0), motif, date, objectif (optionnel), article (optionnel).
- **Achat** : id, utilisateur, nom, description, priorité (`URGENT`, `IMPORTANT`, `NORMAL`, `FAIBLE`), date limite (optionnelle), catégorie, date de création.
- **Article** : id, achat, nom, description, quantité (≥ 1), prix unitaire (≥ 0), magasin ou source, statut (`A_ACHETER`, `MIS_DE_COTE`, `ACHETE`).
- **PhotoArticle** : id, article (au plus une par article), chemin, type MIME, taille.
- **ObjectifEpargne** : id, utilisateur, nom, description, montant cible (> 0), montant initial (≥ 0 et ≤ cible), date cible, catégorie, date de création.

### Valeurs calculées

- Total article = quantité × prix unitaire. Total achat = somme des totaux de ses articles.
- Déjà acheté (achat) = somme des totaux de ses articles `ACHETE`. Reste à acheter = total − déjà acheté.
- Progression d'un achat = déjà acheté / total × 100 (0 si le total est 0).
- Statut déduit d'un achat : `A_PLANIFIER` (aucun article), `EN_COURS` (au moins un article, pas tous achetés), `TERMINE` (au moins un article et tous `ACHETE`). Un article `MIS_DE_COTE` compte comme non acheté.
- Solde = somme des dépôts − somme des retraits.
- Épargné d'un objectif = montant initial + dépôts étiquetés − retraits étiquetés.
- Reste (objectif) = cible − épargné. Progression = épargné / cible × 100.
- Épargne mensuelle recommandée = reste / mois restants. Mois restants = nombre de mois entre aujourd'hui et la date cible, arrondi au supérieur, minimum 1. Aucune recommandation si l'objectif est atteint ou si la date cible est passée.

### Règles métier

RB01 à RB12 du cahier des charges, plus :
- RB13 : un retrait étiqueté avec un objectif ne peut pas dépasser le montant épargné de cet objectif.
- RB14 : l'article et l'objectif référencés par une transaction doivent appartenir à l'utilisateur.
- RB15 : une connexion Google n'est acceptée que si Google certifie l'email (`email_verified`).
- RB16 : un utilisateur doit avoir au moins un moyen de se connecter (mot de passe ou compte Google).

## 6. API REST

- **Auth et profil** : `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (renvoie aussi `aMotDePasse` et `connexionGoogle`), `GET` et `PUT /api/profil`, `PUT /api/profil/mot-de-passe` (le mot de passe actuel n'est exigé que si le compte en a un).
- **Connexion Google** : `GET /api/oauth2/authorization/google` démarre le flux ; Google rappelle `/api/login/oauth2/code/google`. En cas de succès, le serveur pose le cookie de session puis redirige vers le dashboard ; en cas d'échec, vers la page de connexion avec un message d'erreur.
- **Achats** : `GET /api/achats` (filtres : recherche, priorité), `GET /api/achats/{id}`, `POST`, `PUT`, `DELETE`. Chaque achat renvoie total, nombre d'articles, déjà acheté, progression et statut déduit.
- **Articles** : `GET` et `POST /api/achats/{achatId}/articles`, `PUT` et `DELETE /api/articles/{id}`, `PATCH /api/articles/{id}/statut`. Quand le statut passe à `ACHETE`, la réponse contient `retraitSuggere` (montant, motif, articleId). Le front affiche la proposition ; la confirmation passe par la route de retrait.
- **Photo** : `POST`, `GET`, `DELETE /api/articles/{id}/photo`. Formats JPEG, PNG, WebP, 5 Mo maximum, type vérifié sur le contenu du fichier, nom aléatoire, lecture uniquement via cette route authentifiée.
- **Tirelire** : `GET /api/tirelire` (solde, total déposé, total retiré), `POST /api/tirelire/depot`, `POST /api/tirelire/retrait` (`objectifId` et `articleId` optionnels), `GET /api/tirelire/transactions` (pages de 20, plus récentes d'abord).
- **Objectifs** : CRUD sur `/api/objectifs`, avec épargné, reste, progression et épargne mensuelle recommandée.
- **Dashboard** : `GET /api/dashboard` renvoie en un seul appel : solde, total déposé, total retiré, nombre d'achats, total prévu, déjà acheté, reste à financer, nombre d'achats par priorité, objectif en cours à la date cible la plus proche, nombre d'objectifs en cours, trois achats prioritaires (non terminés, triés par priorité puis date limite).

## 7. Écrans et flux

**Écrans :** Connexion et Inscription (chacune avec un bouton « Continuer avec Google » ; **aucune maquette fournie pour ces deux écrans**, à dessiner dans le même style), Dashboard, Mes achats (cartes, recherche, filtre de priorité), Détail d'un achat, Ma tirelire, Mes objectifs, Mon compte. Création d'achat, ajout d'article, dépôt, retrait et création d'objectif s'ouvrent en fenêtre modale.

**Écarts par rapport aux maquettes :** retrait du bloc « Plan Gratuit » (sidebar), des barres de quota, des mentions « Illimité avec Pro », du bouton « Passer à Pro » et du bouton « Partager WhatsApp ». « Paramètres & Abonnement » devient « Mon compte ». Ajout du statut `MIS_DE_COTE` dans le sélecteur de statut d'un article. Le champ « Déjà épargné » de l'objectif correspond au montant initial.

**Mon compte et Google :** la page indique si le compte est relié à Google. Un compte sans mot de passe propose « Définir un mot de passe ». Après une liaison qui a supprimé un ancien mot de passe, un message l'explique.

**Flux clés :**
1. Créer un achat : l'utilisateur arrive ensuite sur l'ajout d'articles.
2. Marquer « Acheté » : dialogue « Retirer 30 000 FCFA de ta tirelire ? » avec montant et motif modifiables. Refuser garde l'article « Acheté ». Un solde insuffisant affiche un message explicatif.
3. Supprimer (achat, article, objectif) : confirmation systématique.

**États communs :** chargement en placeholders, écrans vides avec invitation à agir, notifications de succès et d'erreur. Montants affichés « 150 000 FCFA », dates en français. Sur mobile, le champ photo propose la prise de vue ou le choix d'un fichier.

## 8. Sécurité et gestion des erreurs

- **Mots de passe :** BCrypt, 8 caractères minimum. Email unique, en minuscules.
- **Session :** jeton JWT dans un cookie HttpOnly, Secure, SameSite, durée 24 h. Protection CSRF de Spring activée. Nombre d'essais de connexion limité avant blocage temporaire.
- **Google :** `state` et PKCE gérés par Spring Security ; seul un email certifié par Google est accepté (RB15). Le nom et le prénom viennent du profil Google (valeurs par défaut modifiables si absents). Le secret client est lu dans les variables d'environnement, jamais dans le dépôt. Les URI de redirection (local et production) sont déclarées dans la console Google Cloud, et l'écran de consentement OAuth doit être configuré avant la mise en ligne.
- **Autorisation :** toute requête est filtrée par l'utilisateur connecté (les articles passent par leur achat). Une ressource d'un autre utilisateur renvoie 404.
- **Validation :** Bean Validation côté serveur, mêmes règles en Zod côté formulaire ; le serveur fait autorité.
- **Retraits :** contrôle du solde dans une transaction qui verrouille la tirelire, pour interdire deux retraits simultanés dépassant le solde (RB12).
- **Suppressions :** supprimer un achat supprime ses articles et leurs fichiers photo. Supprimer un article ou un objectif conserve les transactions et vide seulement la référence ; le solde ne change pas.
- **Erreurs :** réponse JSON uniforme (code, message en français, détail par champ). Codes : `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `NOT_FOUND` (404), `EMAIL_ALREADY_USED` (409), `INSUFFICIENT_BALANCE` (422), `OBJECTIVE_INSUFFICIENT` (422). Aucun détail technique n'est renvoyé. Côté interface : messages sous les champs, notifications, redirection vers la connexion si la session expire.

## 9. Tests

- **Backend, calculs :** tests unitaires des totaux, du solde, des progressions, de l'épargne mensuelle, avec cas limites (achat sans article, objectif dépassé, date cible passée ou à moins d'un mois).
- **Backend, règles et API :** tests de service (RB04 à RB14) et tests d'intégration sur PostgreSQL de test (Testcontainers) : isolation entre utilisateurs (404), retrait refusé pour solde insuffisant, retraits simultanés, rejet des fichiers photo invalides.
- **Connexion Google :** tests d'intégration avec un fournisseur simulé (`oidcLogin()` de Spring Security) : création d'un nouvel utilisateur, reconnexion, liaison avec suppression de l'ancien mot de passe, email non certifié refusé, définition d'un mot de passe sur un compte Google.
- **Frontend :** Vitest et Testing Library pour le format des montants, les validations de formulaire et le flux « Acheté → retrait proposé ».
- **Bout en bout :** un test qui parcourt les 16 critères de réussite.

## 10. Organisation et ordre de construction

- **Dépôt Git unique :** `backend/`, `frontend/`, `docs/`.
- **Livrables de documentation :** API documentée (OpenAPI), diagramme de cas d'utilisation, diagramme de classes, MCD, MLD, guide utilisateur court.
- **Ordre, par tranches verticales** (base de données, API, écran et tests de chaque tranche livrés avant la suivante) :
  1. Authentification (email et mot de passe, puis Google) et profil.
  2. Achats, articles et photos.
  3. Tirelire et transactions (dont le flux « Acheté »).
  4. Objectifs d'épargne.
  5. Dashboard.

## 11. Après le MVP

Test de marché avec de vrais utilisateurs (concurrents, acheteurs, prix, offre, marketing), puis décision sur l'abonnement Pro et le paiement Wave et Orange Money. Ajout éventuel de la connexion Apple (compte Apple Developer requis). Ce travail n'est pas couvert ici.

## 12. Points à confirmer par l'auteur

1. **Règles ajoutées par le rédacteur** : RB13 (retrait étiqueté limité à l'épargné de l'objectif), montant initial ≤ cible, durée de session de 24 h, pages de 20 transactions, RB15 et RB16, liaison automatique des comptes avec suppression de l'ancien mot de passe (D13).
2. **Écrans Connexion et Inscription** : pas de maquette fournie.
