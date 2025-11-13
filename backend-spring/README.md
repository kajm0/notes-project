# Backend Spring Boot - Notes API

API REST pour la gestion de notes collaboratives avec authentification JWT.

## Stack technique

- Spring Boot 3.2
- Java 17
- Spring Security (JWT)
- Spring Data JPA + PostgreSQL
- MapStruct (mapping DTO)
- Flyway (migrations)
- SpringDoc OpenAPI (documentation)
- TestContainers (tests)

## Prérequis

- Java 17+
- Maven 3.9+
- PostgreSQL 16 (via Docker recommandé)

## Setup

### Installation

```bash
./mvnw clean install
```

### Scripts

```bash
# Développement
./mvnw spring-boot:run

# Tests
./mvnw test

# Build Docker
docker build -t notes-backend .
docker run -p 8080:8080 notes-backend
```

## Configuration

Variables d'environnement (voir `application.yml`) :

- `SPRING_DATASOURCE_URL` : URL PostgreSQL
- `SPRING_DATASOURCE_USERNAME` : Utilisateur DB
- `SPRING_DATASOURCE_PASSWORD` : Mot de passe DB
- `JWT_SECRET` : Clé secrète JWT (min 256 bits)
- `JWT_EXPIRATION` : Durée validité access token (ms)
- `JWT_REFRESH_EXPIRATION` : Durée validité refresh token (ms)

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` : Inscription
- `POST /login` : Connexion
- `POST /refresh` : Rafraîchir le token

### Notes (`/api/v1/notes`)

- `GET /notes` : Liste avec filtres (query, tag, visibility, pagination)
- `GET /notes/{id}` : Détail d'une note
- `POST /notes` : Créer une note
- `PUT /notes/{id}` : Modifier une note
- `DELETE /notes/{id}` : Supprimer une note

### Partage (`/api/v1/notes`)

- `POST /notes/{id}/share/user` : Partager avec un utilisateur
- `POST /notes/{id}/share/public` : Créer un lien public
- `DELETE /shares/{shareId}` : Révoquer un partage
- `DELETE /public-links/{linkId}` : Révoquer un lien public

### Public (`/api/v1/p`)

- `GET /p/{token}` : Accès public à une note

## Documentation API

Swagger UI disponible : http://localhost:8080/swagger-ui.html

## Tests

```bash
./mvnw test
```

## Compte de démonstration

Un compte démo est créé automatiquement au démarrage de l'application :

- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

Ce compte est créé automatiquement par le composant `DataInitializer` si il n'existe pas déjà.

## Structure du projet

```
src/main/java/com/notes/api/
├── config/          # Configuration Spring
├── entity/          # Entités JPA
├── repository/      # Repositories Spring Data
├── dto/             # Data Transfer Objects
├── service/         # Logique métier
├── controller/      # Contrôleurs REST
├── security/        # JWT & Security
├── exception/       # Gestion des erreurs
└── mapper/          # MapStruct mappers

src/main/resources/
└── db/migration/    # Scripts Flyway
```

## Sécurité

- Authentification JWT (Bearer token)
- BCrypt pour les mots de passe
- Validation ownership sur les ressources
- CORS configuré pour les origines autorisées
- Rate limiting au niveau BFF

## Base de données

Migrations Flyway versionnées dans `src/main/resources/db/migration/`.

Pour réinitialiser la DB :
```bash
./mvnw flyway:clean flyway:migrate
```


