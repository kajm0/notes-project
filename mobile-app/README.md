# Notes Mobile App

React Native mobile application with Expo for the Notes Suite project.

## Features

- 📱 **Cross-platform**: iOS and Android support via Expo
- 🔐 **Authentication**: Login/Register with JWT
- 📝 **Note Management**: Create, read, update, delete notes
- 🔍 **Search & Filters**: Find notes quickly by title, content, or visibility
- 🏷️ **Tags**: Organize notes with tags
- 📄 **Markdown Support**: Write and preview formatted notes
- 📡 **Offline-first**: Cache notes locally with AsyncStorage
- 🔄 **Pull-to-refresh**: Update notes with a simple gesture
- 🎨 **Modern UI**: Beautiful dark theme with React Native Paper

## Tech Stack

- **Expo** ~54.0.0 ✅ (dernière version)
- **React Native** 0.81 ✅
- **Expo Router** ~6.0.14 (file-based routing)
- **React Native Paper** ^5.14.5 (Material Design 3)
- **Zustand** ^4.4.7 (state management)
- **Axios** ^1.6.2 (HTTP client)
- **AsyncStorage** 2.2.0 (local storage)
- **React Native Markdown Display** ^7.0.2 (markdown rendering)

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio with emulator OR physical device
- For iOS: Xcode with iOS simulator (macOS only) OR physical device

## Setup

### Installation

```bash
npm install
```

### Scripts

```bash
# Développement
npm start

# Android
npm run android

# iOS
npm run ios

# Tests
npm test
```

## Configuration

### API Endpoint

L'application se connecte automatiquement au BFF (Backend-For-Frontend) sur le port 4000.

**Configuration automatique** : L'app détecte automatiquement l'IP depuis Expo.

**Configuration manuelle** : Créez un fichier `.env.local` dans `mobile-app/` :

```bash
EXPO_PUBLIC_API_URL=http://VOTRE_IP:4000/api
```

**Endpoints par plateforme** :
- **Android Emulator**: `http://10.0.2.2:4000/api` (détection automatique)
- **iOS Simulator**: `http://localhost:4000/api` (détection automatique)
- **Physical Device**: `http://VOTRE_IP:4000/api` (ex: `http://192.168.100.9:4000/api`)

### Configuration avec Docker

Si vous utilisez Docker pour les services backend :

1. Trouvez l'IP de votre machine : `hostname -I | awk '{print $1}'`
2. Créez `.env.local` : `EXPO_PUBLIC_API_URL=http://VOTRE_IP:4000/api`
3. Assurez-vous que Docker est démarré : `cd docker && docker compose up -d`

## Running the App

### Development

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

### Using Expo Go (Easiest)

1. Install **Expo Go** app on your phone:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Run `npm start` in the mobile-app directory

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app (it will open in Expo Go)

4. Make sure your phone and computer are on the same Wi-Fi network

### Using Android Emulator

1. Open Android Studio
2. Start an emulator (Tools → Device Manager → Play button)
3. Run `npm run android`

### Using iOS Simulator (macOS only)

1. Open Xcode
2. Run `npm run ios`

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Splash/initial redirect
│   ├── login.tsx          # Login/Register screen
│   ├── notes.tsx          # Notes list screen
│   └── note/
│       ├── [id].tsx       # Note detail screen
│       └── edit.tsx       # Note create/edit screen
├── lib/
│   ├── api.ts             # Axios configuration
│   └── store.ts           # Zustand state management
├── types/
│   └── index.ts           # TypeScript types
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Usage

### First Time

1. Launch the app
2. Create an account (Register tab)
3. Login with your credentials

### Main Features

- **Create Note**: Tap the + FAB button on the Notes screen
- **View Note**: Tap any note card to view details
- **Edit Note**: On note detail, tap the pencil FAB button (owner only)
- **Share Note**: On note detail, tap share FAB → share with user by email
- **Public Link**: On note detail, tap link FAB → generate public link
- **Delete Note**: On note detail, tap the delete FAB option (owner only)
- **Search**: Use the search bar to filter notes by title or content
- **Filter by Visibility**: Use chips (All, Private, Shared, Public)
- **Markdown Preview**: Toggle between Edit and Preview modes when creating/editing
- **Pull to Refresh**: Pull down on the notes list to sync with server
- **Offline Mode**: Notes are cached locally and available offline

## Offline-First Strategy

- **Cache**: Notes are automatically cached in AsyncStorage after each fetch
- **Read**: When offline, cached notes are displayed
- **File d'ops en attente** : Les opérations create/update/delete sont mises en queue persistante quand offline
- **Synchronisation automatique** : La queue est synchronisée automatiquement à la reconnexion
- **Offline Indicator**: Yellow banner shows when in offline mode (avec compteur d'opérations en attente)
- **Sync**: Pull-to-refresh syncs data when connection is restored
- **Conflict Resolution**: Last-Write-Wins (server always wins)

### File d'Opérations en Attente

L'application implémente une **file d'opérations persistante** pour gérer les opérations hors ligne :

1. **En mode offline** :
   - Les opérations **CREATE**, **UPDATE**, et **DELETE** sont automatiquement mises en queue dans AsyncStorage
   - Les modifications sont appliquées localement pour l'UI immédiate
   - Un compteur d'opérations en attente est affiché dans le banner offline

2. **À la reconnexion** :
   - La synchronisation démarre automatiquement lors du chargement des notes
   - Les opérations sont exécutées dans l'ordre (FIFO)
   - En cas d'échec, l'opération est réessayée (max 3 tentatives)
   - Les opérations réussies sont retirées de la queue

3. **Gestion des erreurs** :
   - Si une opération échoue après 3 tentatives, elle est abandonnée
   - Les erreurs d'authentification arrêtent la synchronisation
   - Le cache local est mis à jour après chaque synchronisation réussie

## Troubleshooting

### Cannot connect to API

- Check that backend and BFF are running
- Verify API_URL in `lib/api.ts` is correct for your setup
- For physical device, ensure it's on the same Wi-Fi as your computer
- Try using your computer's IP address instead of localhost

### Expo Go shows error

- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo Go app to the latest version

### Android emulator issues

- Ensure Android emulator has internet access
- Try restarting the emulator
- Check Android Studio's AVD settings

## Testing Demo Accounts

Un compte démo est créé automatiquement au démarrage du backend Docker :

- **Email**: `demo@example.com`
- **Password**: `password123`
- **Notes**: 3 notes privées sont créées automatiquement

## License

Part of the Notes Suite project.
