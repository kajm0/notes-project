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

## Prérequis

- **Docker** & **Docker Compose**
- **Node.js** 20+ et **npm**
- **Java 17+** (pour développement backend)
- **Expo CLI** (pour développement mobile)

## Démarrage Rapide

### Commande unique "up"

```bash
cd docker
docker-compose up -d
```

Cette commande démarre :
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend Spring Boot (port 8080)
- BFF NestJS (port 4000)
- Frontend Web (port 8081)

### Accès aux services

- **Frontend Web** : http://localhost:8081
- **BFF API** : http://localhost:4000
- **Backend API** : http://localhost:8080
- **Swagger UI** : http://localhost:8080/swagger-ui.html

### Comptes de démonstration

Un compte utilisateur et des notes de démonstration sont créés automatiquement au démarrage du conteneur :

**Compte utilisateur :**
- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

**Notes par défaut :**
- 3 notes privées sont automatiquement créées pour ce compte au premier démarrage
- Ces notes sont créées via le composant `DataInitializer` dans le backend Spring

> **Note** : Le compte et les notes sont créés uniquement s'ils n'existent pas déjà, permettant de redémarrer les conteneurs sans duplication.

## Documentation par composant

- [Backend Spring Boot](./backend-spring/README.md) - Setup, scripts, tests, comptes démo
- [Frontend Web](./web-frontend/README.md) - Setup, scripts, tests, comptes démo
- [Mobile App](./mobile-app/README.md) - Setup, scripts, tests, comptes démo
- [Docker](./docker/README.md) - Conteneurisation, orchestration

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
