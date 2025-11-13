# Application de Gestion de Notes Collaboratives

Application multi-plateforme avec authentification JWT, partage de notes, et synchronisation offline-first.

## Architecture

```
┌──────────────┐   ┌──────────────┐
│  Web React   │   │  Mobile RN   │
│  (port 8081) │   │  (Expo Go)   │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────┐
│        BFF - NestJS (4000)       │
│  • Cache (Redis)                │
│  • Rate Limiting                │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│   Backend - Spring Boot (8080)   │
│  • JWT Authentication            │
│  • Notes CRUD + Search           │
│  • PostgreSQL + Flyway           │
└─────────────────────────────────┘
```

## 📋 Table des matières

1. [Installation des prérequis](#installation-des-prérequis)
   - [Windows](#windows)
   - [Linux](#linux)
2. [Vérification de l'installation](#vérification-de-linstallation)
3. [Démarrage de l'application](#démarrage-de-lapplication)
4. [Accès aux services](#accès-aux-services)
5. [Comptes de démonstration](#comptes-de-démonstration)
6. [Dépannage](#dépannage)
7. [Documentation par composant](#documentation-par-composant)

---

## Installation des prérequis

Cette application nécessite **Docker** et **Docker Compose** pour fonctionner. Tous les autres outils (Node.js, Java, etc.) sont optionnels et ne sont nécessaires que si vous souhaitez développer ou modifier le code.

### Windows

#### Étape 1 : Installer Docker Desktop

1. **Télécharger Docker Desktop**
   - Ouvrez votre navigateur web
   - Allez sur : https://www.docker.com/products/docker-desktop/
   - Cliquez sur "Download for Windows"
   - Le fichier téléchargé s'appelle `Docker Desktop Installer.exe`

2. **Installer Docker Desktop**
   - Double-cliquez sur le fichier `Docker Desktop Installer.exe` que vous venez de télécharger
   - Si Windows vous demande une autorisation, cliquez sur "Oui"
   - Suivez l'assistant d'installation :
     - Cochez "Use WSL 2 instead of Hyper-V" (recommandé)
     - Cliquez sur "Ok" puis "Install"
   - Attendez la fin de l'installation (cela peut prendre plusieurs minutes)
   - Cliquez sur "Close and restart" pour redémarrer votre ordinateur

3. **Démarrer Docker Desktop**
   - Après le redémarrage, recherchez "Docker Desktop" dans le menu Démarrer
   - Cliquez sur "Docker Desktop" pour l'ouvrir
   - Attendez que Docker démarre (l'icône Docker dans la barre des tâches ne doit plus clignoter)
   - Si Docker vous demande d'accepter les conditions, acceptez-les

4. **Vérifier que Docker fonctionne**
   - Ouvrez l'application "Invite de commandes" (cmd) ou "PowerShell"
   - Tapez la commande suivante et appuyez sur Entrée :
   ```bash
   docker --version
   ```
   - Vous devriez voir quelque chose comme : `Docker version 24.x.x, build xxxxx`
   - Si vous voyez une erreur, attendez quelques secondes et réessayez (Docker peut encore être en train de démarrer)

#### Étape 2 : Vérifier Docker Compose

Docker Compose est inclus avec Docker Desktop, vous n'avez rien d'autre à installer.

- Dans l'invite de commandes ou PowerShell, tapez :
```bash
docker-compose --version
```
- Vous devriez voir : `Docker Compose version v2.x.x`

> **Note importante** : Si vous utilisez une version récente de Docker Desktop, la commande peut être `docker compose` (sans tiret) au lieu de `docker-compose`. Les deux fonctionnent.

---

### Linux

#### Étape 1 : Installer Docker

**Pour Ubuntu/Debian :**

1. **Ouvrir un terminal**
   - Appuyez sur `Ctrl + Alt + T` ou recherchez "Terminal" dans le menu des applications

2. **Mettre à jour les paquets système**
   ```bash
   sudo apt update
   ```

3. **Installer les dépendances nécessaires**
   ```bash
   sudo apt install -y ca-certificates curl gnupg lsb-release
   ```

4. **Ajouter la clé GPG officielle de Docker**
   ```bash
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   ```

5. **Configurer le dépôt Docker**
   ```bash
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

6. **Installer Docker Engine**
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

7. **Ajouter votre utilisateur au groupe docker** (pour éviter d'utiliser `sudo` à chaque fois)
   ```bash
   sudo usermod -aG docker $USER
   ```
   > **Important** : Vous devez vous déconnecter et vous reconnecter (ou redémarrer) pour que cette modification prenne effet.

**Pour Fedora/RHEL/CentOS :**

1. **Ouvrir un terminal**

2. **Installer Docker**
   ```bash
   sudo dnf install -y docker docker-compose
   ```

3. **Démarrer le service Docker**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **Ajouter votre utilisateur au groupe docker**
   ```bash
   sudo usermod -aG docker $USER
   ```
   > **Important** : Déconnectez-vous et reconnectez-vous pour que cette modification prenne effet.

**Pour Arch Linux :**

1. **Ouvrir un terminal**

2. **Installer Docker**
   ```bash
   sudo pacman -S docker docker-compose
   ```

3. **Démarrer le service Docker**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **Ajouter votre utilisateur au groupe docker**
   ```bash
   sudo usermod -aG docker $USER
   ```
   > **Important** : Déconnectez-vous et reconnectez-vous pour que cette modification prenne effet.

#### Étape 2 : Vérifier l'installation Docker

- Ouvrez un nouveau terminal (important après avoir ajouté votre utilisateur au groupe docker)
- Tapez :
```bash
docker --version
```
- Vous devriez voir : `Docker version 24.x.x, build xxxxx`

#### Étape 3 : Vérifier Docker Compose

- Dans le terminal, tapez :
```bash
docker-compose --version
```
- Vous devriez voir : `Docker Compose version v2.x.x`

> **Note** : Sur les versions récentes, la commande peut être `docker compose` (sans tiret) au lieu de `docker-compose`.

---

## Vérification de l'installation

Avant de continuer, assurez-vous que tout est correctement installé :

### Windows

Ouvrez PowerShell ou l'Invite de commandes et exécutez :

```bash
docker --version
docker-compose --version
```

Les deux commandes doivent afficher un numéro de version. Si vous voyez une erreur, vérifiez que Docker Desktop est bien démarré (icône Docker visible dans la barre des tâches).

### Linux

Ouvrez un terminal et exécutez :

```bash
docker --version
docker-compose --version
```

Les deux commandes doivent afficher un numéro de version. Si vous voyez une erreur de permissions, assurez-vous d'avoir redémarré votre session après avoir ajouté votre utilisateur au groupe docker.

---

## Démarrage de l'application

Une fois Docker installé et vérifié, vous pouvez démarrer l'application en quelques étapes simples :

### Étape 1 : Ouvrir un terminal

- **Windows** : Ouvrez PowerShell ou l'Invite de commandes
- **Linux** : Ouvrez un terminal (Ctrl + Alt + T sur Ubuntu)

### Étape 2 : Naviguer vers le dossier du projet

Si vous n'êtes pas déjà dans le dossier du projet, utilisez la commande `cd` :

```bash
cd /chemin/vers/notes-suite
```

**Exemple sur Windows :**
```bash
cd C:\Users\VotreNom\Documents\notes-suite
```

**Exemple sur Linux :**
```bash
cd ~/Documents/notes-suite
```

### Étape 3 : Aller dans le dossier docker

```bash
cd docker
```

### Étape 4 : Démarrer tous les services

```bash
docker-compose up -d
```

> **Explication** : 
> - `docker-compose up` : Démarre tous les services définis dans le fichier docker-compose.yml
> - `-d` : Lance les services en arrière-plan (mode "detached"), vous pouvez continuer à utiliser votre terminal

**La première fois**, cette commande peut prendre plusieurs minutes car Docker doit :
- Télécharger les images nécessaires (PostgreSQL, Redis, etc.)
- Construire les images de l'application
- Démarrer tous les conteneurs

Vous verrez beaucoup de messages dans le terminal. C'est normal ! Attendez que la commande se termine.

### Étape 5 : Vérifier que tout fonctionne

Attendez environ 1-2 minutes pour que tous les services démarrent complètement, puis vérifiez l'état des conteneurs :

```bash
docker-compose ps
```

Vous devriez voir tous les services avec le statut "Up" :
- `notes-postgres` (PostgreSQL)
- `notes-redis` (Redis)
- `notes-backend` (Backend Spring Boot)
- `notes-bff` (BFF NestJS)
- `notes-frontend` (Frontend Web)

### Étape 6 : Vérifier les logs (optionnel)

Si quelque chose ne fonctionne pas, vous pouvez voir les logs :

```bash
docker-compose logs
```

Pour voir les logs d'un service spécifique :
```bash
docker-compose logs backend
docker-compose logs frontend
```

---

## Accès aux services

Une fois l'application démarrée, vous pouvez accéder aux différents services via votre navigateur web :

### Services principaux

- **Frontend Web** (Interface utilisateur) : http://localhost:8081
  - C'est ici que vous utiliserez l'application !
  - Ouvrez votre navigateur et allez à cette adresse

- **BFF API** : http://localhost:4000
  - API intermédiaire (Backend for Frontend)

- **Backend API** : http://localhost:8080
  - API principale de l'application

- **Swagger UI** (Documentation de l'API) : http://localhost:8080/swagger-ui.html
  - Interface pour tester et explorer l'API

### Comment tester que tout fonctionne

1. Ouvrez votre navigateur web
2. Allez à : **http://localhost:8081**
3. Vous devriez voir la page de connexion de l'application
4. Si la page se charge, tout fonctionne correctement ! 🎉

---

## Comptes de démonstration

Un compte utilisateur et des notes de démonstration sont créés automatiquement au démarrage du conteneur :

### Compte utilisateur

- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

### Notes par défaut

- 3 notes privées sont automatiquement créées pour ce compte au premier démarrage
- Ces notes sont créées via le composant `DataInitializer` dans le backend Spring

> **Note** : Le compte et les notes sont créés uniquement s'ils n'existent pas déjà, permettant de redémarrer les conteneurs sans duplication.

### Comment se connecter

1. Allez sur http://localhost:8081
2. Entrez l'email : `demo@example.com`
3. Entrez le mot de passe : `password123`
4. Cliquez sur "Se connecter" ou "Login"

---

## Dépannage

### Problème : "docker: command not found" ou "docker-compose: command not found"

**Windows :**
- Vérifiez que Docker Desktop est bien démarré (icône dans la barre des tâches)
- Redémarrez votre terminal/PowerShell
- Si le problème persiste, réinstallez Docker Desktop

**Linux :**
- Vérifiez que Docker est bien installé : `docker --version`
- Si vous voyez une erreur de permissions, assurez-vous d'avoir redémarré votre session après avoir ajouté votre utilisateur au groupe docker
- Essayez avec `sudo` : `sudo docker --version` (si cela fonctionne, c'est un problème de permissions)

### Problème : Les ports sont déjà utilisés

Si vous voyez une erreur comme "port 8080 is already allocated" :

**Windows :**
1. Identifiez quel programme utilise le port :
   ```bash
   netstat -ano | findstr :8080
   ```
2. Arrêtez le programme qui utilise le port, ou modifiez les ports dans `docker/docker-compose.yml`

**Linux :**
1. Identifiez quel programme utilise le port :
   ```bash
   sudo lsof -i :8080
   ```
2. Arrêtez le programme : `sudo kill -9 <PID>` (remplacez `<PID>` par le numéro de processus)

### Problème : Les conteneurs ne démarrent pas

1. Vérifiez les logs :
   ```bash
   cd docker
   docker-compose logs
   ```

2. Arrêtez tous les conteneurs et redémarrez :
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. Si le problème persiste, reconstruisez les images :
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Problème : "Cannot connect to the Docker daemon"

**Windows :**
- Vérifiez que Docker Desktop est bien démarré
- Redémarrez Docker Desktop depuis le menu Démarrer

**Linux :**
- Démarrez le service Docker :
  ```bash
  sudo systemctl start docker
  ```
- Vérifiez que le service est actif :
  ```bash
  sudo systemctl status docker
  ```

### Problème : La page web ne se charge pas

1. Vérifiez que les conteneurs sont bien démarrés :
   ```bash
   cd docker
   docker-compose ps
   ```

2. Vérifiez les logs du frontend :
   ```bash
   docker-compose logs frontend
   ```

3. Attendez quelques secondes supplémentaires (les services peuvent prendre du temps à démarrer)

4. Essayez d'accéder directement à l'API backend : http://localhost:8080/swagger-ui.html
   - Si cela fonctionne, le problème vient du frontend
   - Si cela ne fonctionne pas, le problème vient du backend

### Problème : Erreur de mémoire (Out of memory)

**Windows :**
- Ouvrez Docker Desktop
- Allez dans Settings > Resources
- Augmentez la mémoire allouée à Docker (minimum 4 GB recommandé)

**Linux :**
- Vérifiez l'utilisation de la mémoire : `free -h`
- Fermez d'autres applications pour libérer de la mémoire

### Arrêter l'application

Pour arrêter tous les services :

```bash
cd docker
docker-compose down
```

Pour arrêter et supprimer toutes les données (attention, cela supprime la base de données) :

```bash
cd docker
docker-compose down -v
```

---

## Documentation par composant

Pour plus de détails sur chaque composant de l'application :

- [Backend Spring Boot](./backend-spring/README.md) - Setup, scripts, tests, comptes démo
- [Frontend Web](./web-frontend/README.md) - Setup, scripts, tests, comptes démo
- [Mobile App](./mobile-app/README.md) - Setup, scripts, tests, comptes démo
- [Docker](./docker/README.md) - Conteneurisation, orchestration

---

## Structure du projet

```
notes-suite/
├── backend-spring/      # API REST Spring Boot
├── bff-nestjs/          # Backend for Frontend (bonus)
├── web-frontend/        # Application React
├── mobile-app/          # Application React Native (Expo)
├── docker/              # Docker Compose
└── README.md            # Ce fichier
```

---

## Besoin d'aide ?

Si vous rencontrez un problème non listé ici :

1. Vérifiez les logs : `docker-compose logs`
2. Consultez la documentation de chaque composant dans les README respectifs
3. Vérifiez que tous les prérequis sont bien installés et fonctionnels
