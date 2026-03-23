# 🚀 GerAI — Application de Gestion des Ressources Humaines Intelligente

> Application Frontend Angular connectée à un backend Spring Boot, avec authentification Keycloak, chat en temps réel via WebSocket, et tableau de bord par rôle.

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Technologies utilisées](#️-technologies-utilisées)
- [Installation](#-installation)
- [Configuration Keycloak](#-configuration-keycloak)
- [Lancement](#️-lancement)
- [Structure du projet](#️-structure-du-projet)
- [Variables d'environnement](#-variables-denvironnement)
- [Flux d'authentification](#-flux-dauthentification)
- [Comptes de test](#-comptes-de-test)
- [Résolution de problèmes fréquents](#-résolution-de-problèmes-fréquents)
- [Développé par](#-développé-par)

---

## ✅ Prérequis

Avant de commencer, assure-toi d'avoir installé les outils suivants **dans l'ordre** :

| Outil | Version requise | Lien de téléchargement |
|---|---|---|
| **Node.js** | v22.x (LTS) | [nodejs.org](https://nodejs.org) |
| **Yarn** | v1.22.x | `npm install -g yarn` |
| **Angular CLI** | v21.x | `npm install -g @angular/cli@21` |
| **Docker Desktop** | v28.x (ou plus récent) | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | Dernière version | [git-scm.com](https://git-scm.com) |

> ⚠️ **Important** : Ce projet utilise **Yarn** comme gestionnaire de paquets. N'utilise **pas** `npm install`, sinon des conflits de dépendances peuvent survenir.

---

## 🛠️ Technologies utilisées

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 21.0.5 | Framework frontend |
| Angular CLI | 21.0.2 | Outils de développement |
| Node.js | 22.x | Environnement d'exécution |
| TypeScript | 5.9.3 | Langage typé |
| keycloak-angular | 21.0.0 | Intégration Keycloak dans Angular |
| keycloak-js | 26.2.3 | Client JavaScript Keycloak |
| Bootstrap | 5.3.8 | Framework CSS |
| SCSS | — | Styles personnalisés |
| STOMP / SockJS | 7.x / 1.6.x | WebSocket (chat temps réel) |
| ng-apexcharts / apexcharts | — | Graphiques et analytics |

---

## 📦 Installation

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/saadaouima/GerAI-Application-GRH-
cd GerAI-Application-GRH-
```

> Si la branche principale ne contient pas les dernières fonctionnalités, passe sur la bonne branche :

```bash
git checkout dashboard-employe-chef
```

### Étape 2 — Installer les dépendances

```bash
yarn install
```

> ⏳ Cette étape peut prendre quelques minutes la première fois.

---

## 🔐 Configuration Keycloak

L'application **ne peut pas fonctionner** sans un serveur Keycloak en cours d'exécution. Suis ces étapes attentivement.

### Étape 1 — Lancer Keycloak via Docker

Assure-toi que **Docker Desktop est ouvert et en cours d'exécution**, puis lance cette commande :

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  --restart always \
  quay.io/keycloak/keycloak:26.5.5 start-dev
```

> 💡 **Si le container existe déjà** (au prochain démarrage) :
> ```bash
> docker start keycloak
> ```

> 💡 **Pour vérifier que Keycloak tourne** : rends-toi sur [http://localhost:8080](http://localhost:8080)

---

### Étape 2 — Créer le Realm

1. Va sur [http://localhost:8080](http://localhost:8080)
2. Connecte-toi avec : `admin` / `admin`
3. En haut à gauche, clique sur **"Create Realm"**
4. Nom du realm : **`gerai`** → clique sur **Create**

---

### Étape 3 — Configurer le Client

1. Dans le realm `gerai`, va dans **Clients** → **Create client**
2. Remplis comme suit :
   - **Client type** : `OpenID Connect`
   - **Client ID** : `gerai`
3. Clique **Next**
4. Active les options :
   - ✅ **Standard flow**
   - ✅ **Direct access grants**
5. Clique **Next** puis **Save**
6. Dans l'onglet **Settings** du client, configure :
   - **Valid redirect URIs** : `http://localhost:4200/*`
   - **Web origins** : `http://localhost:4200`
7. Clique **Save**

---

### Étape 4 — Créer les Rôles

1. Va dans **Realm roles** → **Create role**
2. Crée les trois rôles suivants (un par un) :

| Nom du rôle |
|---|
| `employe` |
| `chef` |
| `admin_rh` |

---

### Étape 5 — Créer les Utilisateurs de test

#### Utilisateur Employé

1. Va dans **Users** → **Add user**
2. **Username** : `nour`
3. Clique **Create**
4. Onglet **Credentials** → **Set password** → désactive "Temporary" → **Save**
5. Onglet **Role mapping** → **Assign role** → sélectionne `employe` → **Assign**

#### Utilisateur Chef

1. Va dans **Users** → **Add user**
2. **Username** : `mariem`
3. Clique **Create**
4. Onglet **Credentials** → **Set password** → désactive "Temporary" → **Save**
5. Onglet **Role mapping** → **Assign role** → sélectionne `chef` → **Assign**

---

## ▶️ Lancement

Une fois Keycloak en cours d'exécution, lance le projet Angular :

```bash
yarn start
```

L'application sera disponible sur : **[http://localhost:4200](http://localhost:4200)**

> ⚠️ **L'ordre de démarrage est important** :
> 1. Lance Docker Desktop
> 2. Démarre le container Keycloak (`docker start keycloak`)
> 3. Lance Angular (`yarn start`)

---

## 🗂️ Structure du projet

```
GerAI-Application-GRH-/
├── src/
│   ├── app/
│   │   ├── guards/              # Protection des routes par rôle (roleRedirectGuard)
│   │   ├── gerai/
│   │   │   ├── employe/         # Dashboard, Profil, Demandes de congé
│   │   │   ├── chef/            # Dashboard, Équipe, Tâches, Rapports
│   │   │   ├── models/          # Interfaces et types TypeScript
│   │   │   └── services/        # Services HTTP (API Spring Boot)
│   │   └── theme/
│   │       └── layout/          # Navigation, Sidebar, Layout général
│   ├── environments/
│   │   ├── environment.ts       # Config développement (localhost)
│   │   └── environment.prod.ts  # Config production
│   ├── assets/                  # Images, icônes
│   └── scss/                    # Styles globaux SCSS
├── package.json                 # Dépendances du projet
├── angular.json                 # Configuration Angular
└── yarn.lock                    # Versions exactes des dépendances
```

---

## 🌐 Variables d'environnement

Le fichier `src/environments/environment.ts` contient toute la configuration. **Tu n'as rien à modifier** si tu exécutes en local avec les valeurs par défaut :

```typescript
export const environment = {
  production: false,

  // Keycloak (doit tourner sur le port 8080)
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'gerai',
    clientId: 'gerai'
  },

  // API Backend Spring Boot
  apiUrl: 'http://localhost:8085/api',

  // WebSocket (chat temps réel)
  websocketUrl: 'ws://localhost:8085/ws',
};
```

> 💡 Si ton backend Spring Boot tourne sur un autre port, modifie `apiUrl` et `websocketUrl` en conséquence.

---

## 🔄 Flux d'authentification

```
http://localhost:4200
        ↓
  roleRedirectGuard
  (vérifie si l'utilisateur est connecté)
        ↓
  Keycloak Login Page
  (http://localhost:8080)
        ↓
  Token JWT reçu
        ↓
  ┌──────────────────────────────────────┐
  │  Rôle employe  →  /employe/dashboard  │
  │  Rôle chef     →  /chef/dashboard     │
  │  Rôle admin_rh →  /admin/dashboard    │
  └──────────────────────────────────────┘
```

---

## 👤 Comptes de test

| Rôle | Nom d'utilisateur | Accès |
|---|---|---|
| Employé | `nour` | Dashboard Employé, Profil, Demandes |
| Chef | `mariem` | Dashboard Chef, Équipe, Tâches |

---

## 🐛 Résolution de problèmes fréquents

### ❌ La page reste blanche ou redirige en boucle

**Cause** : Keycloak n'est pas démarré.

**Solution** :
```bash
docker start keycloak
# Attends 30 secondes que Keycloak soit prêt, puis relance yarn start
yarn start
```

---

### ❌ Erreur `Cannot GET /` ou `404` sur localhost:4200

**Cause** : Le serveur Angular n'est pas lancé.

**Solution** :
```bash
yarn start
```

---

### ❌ Erreur de compilation Angular / cache corrompu

**Solution** (Windows) :
```bash
rmdir /s /q .angular
yarn start
```

**Solution** (Mac / Linux) :
```bash
rm -rf .angular
yarn start
```

---

### ❌ Erreur `ENOENT` ou modules introuvables après `git pull`

**Cause** : Des nouvelles dépendances ont été ajoutées.

**Solution** :
```bash
yarn install
```

---

### ❌ Le port 8080 est déjà utilisé

**Cause** : Un autre service tourne sur le port 8080.

**Solution** : Arrête le service en conflit, ou change le port de Keycloak :
```bash
docker run -d \
  --name keycloak \
  -p 8180:8080 \
  ...
```
Puis mets à jour `environment.ts` :
```typescript
keycloak: {
  url: 'http://localhost:8180',
  ...
}
```

---

### ❌ `yarn` n'est pas reconnu comme commande

**Solution** :
```bash
npm install -g yarn
```
Puis ferme et réouvre ton terminal.

---

### ❌ `ng` n'est pas reconnu comme commande

**Solution** :
```bash
npm install -g @angular/cli@21
```

---

### ❌ Docker Desktop n'est pas lancé

**Symptôme** : `docker: command not found` ou `Cannot connect to the Docker daemon`

**Solution** : Ouvre **Docker Desktop** depuis le menu démarrer et attends qu'il soit complètement démarré (icône de baleine fixe dans la barre système), puis relance ta commande Docker.

---

## 👩‍💻 Développé par

| Développeuse |
|---|
| **Nour El Houda Boussaidi** |           
| **Mariem Saadaoui** |     

---

> 📌 *Projet GerAI — Application de Gestion des Ressources Humaines Intelligente*
> Licence : MIT