# 🚀 GerAI — Frontend Angular
> Application de Gestion des Ressources Humaines Intelligente

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Configuration Keycloak](#-configuration-keycloak)
- [Lancement](#-lancement)
- [Structure du projet](#-structure-du-projet)
- [Comptes de test](#-comptes-de-test)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

| Outil | Version recommandée | Lien |
|-------|-------------------|------|
| **Node.js** | v22 | https://nodejs.org |
| **Yarn** | v1.22+ | `npm install -g yarn` |
| **Angular CLI** | v21.0.3 | `npm install -g @angular/cli@21` |
| **Docker Desktop** | v28.5.2+ | https://www.docker.com/products/docker-desktop |

> ⚠️ **Important** : Ce projet utilise **Yarn** et non npm. N'utilisez pas `npm install`.

---

## 🛠️ Technologies utilisées

```
Angular CLI       21.0.3
Angular           21.0.5
Node.js           22.20.0
keycloak-angular  21.0.0    (authentification)
keycloak-js       26.2.3   (client Keycloak)
Bootstrap         5.3.8
TypeScript        5.9.3
SCSS
```

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/saadaouima/GerAI-Application-GRH-
cd GerAI-Application-GRH-
git checkout frontend
```

### 2. Installer les dépendances

```bash
yarn install
```

> ⏳ Cette étape peut prendre quelques minutes la première fois.

---

## 🔐 Configuration Keycloak

L'application nécessite un serveur **Keycloak** en cours d'exécution.

### 1. Lancer Keycloak via Docker

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  --restart always \
  quay.io/keycloak/keycloak:26.0.5 start-dev
```

> Si le container existe déjà : `docker start keycloak`

### 2. Configurer le Realm

Accédez à http://localhost:8080 → connectez-vous avec `admin / admin`

#### Créer le Realm
1. Cliquez sur le menu déroulant en haut à gauche → **Create Realm**
2. Nom du realm : `gerai` → **Create**

#### Configurer le Client
1. **Clients** → **Create client**
2. Client ID : `gerai`
3. Client type : `OpenID Connect`
4. **Next** → activer **Standard flow** + **Direct access grants** → **Save**
5. Dans l'onglet **Settings** :
   - Valid redirect URIs : `http://localhost:4200/*`
   - Web origins : `http://localhost:4200`
   - **Save**

#### Créer les Rôles
1. **Realm roles** → **Create role**
2. Créer les 3 rôles suivants (en minuscules) :
   ```
   employe
   chef
   admin_rh
   ```

#### Créer les Utilisateurs de test
1. **Users** → **Create new user**

**Utilisateur Employé :**
```
Username  : nour
Email     : nour@gerai.tn
Last name : Boussaidi
First name: Nour El Houda
```
→ Onglet **Credentials** → Set password : `nour` → désactiver **Temporary**
→ Onglet **Role mapping** → Assign role → `employe`

**Utilisateur Chef :**
```
Username  : mariem
Email     : mariem@gerai.tn
Last name : Saadaoui
First name: Mariem
```
→ Onglet **Credentials** → Set password : `mariem` → désactiver **Temporary**
→ Onglet **Role mapping** → Assign role → `chef`

#### Augmenter la durée du token *(optionnel mais recommandé)*
**Realm Settings** → **Tokens** → **Access Token Lifespan** : `30 minutes` → **Save**

### 3. Vérifier la configuration Angular

Ouvrez `src/environments/environment.ts` et vérifiez :

```typescript
export const environment = {
  production: false,
  keycloak: {
    url:      'http://localhost:8080',
    realm:    'gerai',
    clientId: 'gerai'
  }
};
```

---

## ▶️ Lancement

```bash
yarn start
```

L'application sera disponible sur : **http://localhost:4200**

> Angular redirige automatiquement vers la page de connexion Keycloak.

---

## 🗂️ Structure du projet

```
src/
├── app/
│   ├── guards/
│   │   └── auth.guard.ts          # Guards d'authentification et de rôles
│   ├── gerai/
│   │   ├── employe/               # Module Employé
│   │   │   ├── dashboard-employe.ts
│   │   │   ├── profil/
│   │   │   ├── demandes/
│   │   │   ├── taches/
│   │   │   └── projets/
│   │   └── chef/                  # Module Chef
│   │       ├── dashboard-chef.ts
│   │       ├── equipe/
│   │       ├── demandes/
│   │       ├── taches/
│   │       ├── projets/
│   │       ├── rapports/
│   │       ├── chat/              
│   │       └── notifications/
│   └── theme/
│       └── layout/
│           └── admin/             # Layout principal
│               ├── nav-bar/
│               └── navigation/
├── environments/
│   ├── environment.ts             # Config développement
│   └── environment.prod.ts        # Config production
└── main.ts                        # Bootstrap + provideKeycloak
```

---

## 👤 Comptes de test

| Utilisateur | Mot de passe | Rôle | Dashboard |
|-------------|-------------|------|-----------|
| `nour` | `nour` | Employé | `/employe/dashboard` |
| `mariem` | `mariem` | Chef | `/chef/dashboard` |

---

## 🔄 Flux d'authentification

```
http://localhost:4200
        ↓
  roleRedirectGuard
        ↓
  Keycloak Login Page
        ↓
  Token JWT reçu
        ↓
  Lecture du rôle dans tokenParsed
        ↓
  ┌─────────────────────────┐
  │  employe → /employe/dashboard  │
  │  chef    → /chef/dashboard     │
  │  admin   → /admin/dashboard    │
  └─────────────────────────┘
```

---

## 📝 Notes importantes

> 🔑 **Keycloak doit être lancé AVANT** de démarrer Angular.

> 🚫 **Ne pas utiliser `npm install`** — ce projet utilise Yarn exclusivement.

> 🗑️ **En cas de problème bizarre**, videz le cache Angular :
> ```bash
> rmdir /s /q .angular
> yarn start
> ```

---

## 👩‍💻 Développé par

**Nour El Houda Boussaidi/** 
**Mariem Saadaoui**

*Projet GerAI — Application de Gestion RH Intelligente*