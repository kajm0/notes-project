# Notes Collaborative Application

Application complète de gestion de notes collaboratives multi-plateforme avec backend Spring Boot, BFF NestJS, frontend React et application mobile React Native.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ARCHITECTURE GLOBALE                       │
└─────────────────────────────────────────────────────────┘

  📱 Mobile App                    🌐 Web Browser
  (React Native)                   (React SPA)
         │                                │
         │                                │
         │                                ▼
         │                    ┌────────────────────┐
         │                    │   BFF NestJS       │
         │                    │   (Port 4000)      │
         │                    │   - Cache Redis    │
         │                    │   - Composition    │
         │                    │   - Rate Limiting  │
         │                    └────────────────────┘
         │                                │
         │                                │
         └────────────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Backend Spring Boot │
                │  (Port 8080)         │
                │  - Business Logic    │
                │  - JWT Auth          │
                │  - PostgreSQL        │
                └──────────────────────┘
```

## Stack technique

### Backend
- **Spring Boot 3** (Java 17)
- **Spring Security** (JWT)
- **Spring Data JPA** + **PostgreSQL 16**
- **MapStruct** (DTO mapping)
- **Flyway** (migrations)
- **SpringDoc OpenAPI** (documentation)

### BFF (Backend-For-Frontend)
- **NestJS 10** (TypeScript)
- **Redis 7** (cache)
- **Axios** (HTTP client)
- **@nestjs/throttler** (rate limiting)

### Frontend Web
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Zustand** (state management)
- **React Router 6**
- **shadcn/ui** + **Tailwind CSS**
- **React Hook Form** + **Zod**

### Mobile
- **React Native** + **Expo**
- **WatermelonDB** (offline-first)
- **Zustand** (state management)
- **Expo Router**

### Infrastructure
- **Docker** + **Docker Compose**
- **PostgreSQL 16**
- **Redis 7**

## Prérequis

- **Java 17+** (OpenJDK)
- **Node.js 18+** et **npm**
- **Docker** et **Docker Compose**
- **Git**

Pour le mobile :
- **Android Studio** (émulateur Android) ou device physique
- **Expo Go** (app mobile pour tester)

## Structure du projet

```
notes-suite/
├── backend-spring/       # API Spring Boot
├── bff-nestjs/          # Backend-For-Frontend NestJS
├── web-frontend/        # Application web React
├── mobile-app/          # Application mobile React Native
├── docker/              # Configuration Docker Compose
└── README.md            # Ce fichier
```

## Démarrage rapide

### 1. Cloner le repository

```bash
git clone <repository-url>
cd notes-suite
```

### 2. Démarrer les services backend (Docker)

```bash
cd docker
docker compose up -d
```

Cela démarre :
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend Spring Boot (port 8080)
- BFF NestJS (port 4000)
- Frontend React (port 3000)

### 3. Vérifier les services

- **API Backend** : http://localhost:8080/swagger-ui.html
- **BFF** : http://localhost:4000/api
- **Frontend Web** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

### 4. Application mobile

```bash
cd mobile-app
npm install
npm start
```

Scanner le QR code avec l'application Expo Go.

## Comptes de démonstration

Des comptes de test sont automatiquement créés :

- **Email** : `demo@notes.app`
- **Password** : `Demo123!`

- **Email** : `user@notes.app`
- **Password** : `User123!`

## Fonctionnalités

### Authentification
- Inscription / Connexion
- JWT avec refresh token
- Sessions sécurisées

### Gestion de notes
- Création, édition, suppression de notes
- Support Markdown complet
- Tags pour organisation
- Recherche et filtres
- Visibilité : PRIVATE, SHARED, PUBLIC

### Partage
- Partage avec d'autres utilisateurs (lecture seule)
- Génération de liens publics
- Révocation des partages

### Mode hors-ligne (mobile)
- Synchronisation automatique
- File d'attente des modifications
- Résolution de conflits (Last-Write-Wins)

## Documentation détaillée

Chaque module possède son propre README :

- [Backend Spring Boot](./backend-spring/README.md)
- [BFF NestJS](./bff-nestjs/README.md)
- [Frontend React](./web-frontend/README.md)
- [Mobile React Native](./mobile-app/README.md)

## Développement

### Backend

```bash
cd backend-spring
./mvnw spring-boot:run
```

### BFF

```bash
cd bff-nestjs
npm install
npm run start:dev
```

### Frontend Web

```bash
cd web-frontend
npm install
npm run dev
```

### Mobile

```bash
cd mobile-app
npm install
npm start
```

## Tests

### Backend
```bash
cd backend-spring
./mvnw test
```

### BFF
```bash
cd bff-nestjs
npm test
```

### Frontend
```bash
cd web-frontend
npm test
npm run test:e2e
```

## Architecture des données

### Modèle principal

- **User** : utilisateurs de l'application
- **Note** : notes avec contenu Markdown
- **Tag** : étiquettes pour organiser les notes
- **Share** : partages entre utilisateurs
- **PublicLink** : liens publics temporaires

## Sécurité

- **JWT** pour l'authentification
- **BCrypt** pour les mots de passe
- **CORS** configuré
- **Rate limiting** au niveau BFF
- **Validation** des inputs côté backend

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

Développé dans le cadre d'un exercice technique full-stack.

