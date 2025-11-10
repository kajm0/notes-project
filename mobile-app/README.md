# Notes Mobile App - React Native Expo

Application mobile pour la gestion de notes avec support hors-ligne.

## Prérequis

- Node.js 18+
- Expo CLI : `npm install -g expo-cli`
- Android Studio (pour émulateur Android) ou device physique
- Expo Go app (pour tester sur device physique)

## Installation

```bash
npm install
```

## Développement

### Démarrer le serveur de développement

```bash
npm start
```

Scanner le QR code avec l'app Expo Go sur votre téléphone.

### Lancer sur émulateur Android

```bash
npm run android
```

### Lancer sur simulateur iOS (Mac uniquement)

```bash
npm run ios
```

## Structure

```
mobile-app/
├── app/                  # Routes Expo Router
│   ├── (auth)/          # Écrans authentification
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/          # Navigation principale
│   │   ├── notes.tsx
│   │   └── profile.tsx
│   └── _layout.tsx      # Layout racine
├── lib/                 # Utilitaires
│   ├── api.ts          # Client API
│   ├── storage.ts      # AsyncStorage wrapper
│   └── store.ts        # Zustand store
└── components/         # Composants réutilisables
```

## Fonctionnalités

### Implémentées
- Authentification JWT
- Liste des notes
- Création/édition de notes
- Stockage du token (AsyncStorage)

### Fonctionnalités offline-first (architecture documentée)

L'architecture offline-first utilise une approche **Last-Write-Wins** :

1. **Stockage local** : AsyncStorage pour données simples, WatermelonDB pour données complexes
2. **File d'attente** : Les opérations en mode hors-ligne sont stockées dans une queue
3. **Synchronisation** : À la reconnexion, la queue est traitée séquentiellement
4. **Résolution de conflits** : Last-Write-Wins (dernière modification gagne)

### Pour implémenter offline-first complet

1. Installer WatermelonDB :
```bash
npm install @nozbe/watermelondb @nozbe/with-observables
```

2. Créer le schéma de base de données locale

3. Implémenter le service de synchronisation

4. Utiliser NetInfo pour détecter la connectivité

## Build de production

### Android APK

```bash
expo build:android
```

### iOS (Mac + Apple Developer Account requis)

```bash
expo build:ios
```

## Tests

L'architecture supporte les tests unitaires avec Jest.

## Configuration

Variables d'environnement dans `app.json` :
- `EXPO_PUBLIC_API_URL` : URL du backend (défaut: http://localhost:8080)

## Comptes de démonstration

- Email : demo@notes.app
- Password : Demo123!

