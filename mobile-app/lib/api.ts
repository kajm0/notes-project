import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const extractHost = (raw?: string | null): string | null => {
  if (!raw) return null;
  const cleaned = raw.replace(/^\s+|\s+$/g, '').replace(/^[a-zA-Z]+:\/\//, '');
  if (!cleaned) return null;
  const hostPart = cleaned.split('/')[0];
  const [host] = hostPart.split(':');
  return host || null;
};

const normalizeUrl = (rawUrl: string): string => {
  if (!rawUrl) {
    return rawUrl;
  }
  const trimmed = rawUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveHostFromEnvironment = (): string | null => {
  const candidates: Array<string | undefined | null> = [
    Constants.expoConfig?.hostUri,
    (Constants.expoConfig as any)?.extra?.expoGo?.hostUri,
    (Constants.expoConfig as any)?.extra?.expoGo?.debuggerHost,
    (Constants as any)?.manifest?.hostUri,
    (Constants as any)?.manifest?.debuggerHost,
    NativeModules?.SourceCode?.scriptURL,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate ?? undefined);
    if (host) {
      return host;
    }
  }

  return null;
};

const isTunnelMode = (): boolean => {
  // Détecter le mode tunnel Expo
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest?.hostUri;
  if (hostUri && (hostUri.includes('tunnel.exp.direct') || hostUri.includes('tunnel'))) {
    return true;
  }
  // Vérifier aussi via variable d'environnement
  return process.env.EXPO_PUBLIC_TUNNEL_MODE === 'true';
};

const resolveApiBaseUrl = (): string => {
  // Priorité 1: Variable d'environnement explicite (obligatoire en mode tunnel)
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BFF_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  // Priorité 2: Mode tunnel détecté - nécessite EXPO_PUBLIC_API_URL
  if (isTunnelMode()) {
    // Fallback vers localhost (ne fonctionnera pas en tunnel, mais évite une erreur)
    return 'http://localhost:4000/api';
  }

  // Priorité 3: Détection automatique pour mode LAN/local
  const host = resolveHostFromEnvironment();
  if (host) {
    if (Platform.OS === 'android' && (host === 'localhost' || host.startsWith('127.'))) {
      return 'http://10.0.2.2:4000/api';
    }
    return `http://${host}:4000/api`;
  }

  // Fallback par défaut
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }

  return 'http://localhost:4000/api';
};

const API_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gérer l'expiration du token (401 ou 403 avec message token)
    if (error.response?.status === 401 ||
        (error.response?.status === 403 &&
         error.response?.data?.message?.toLowerCase().includes('token'))) {
      await AsyncStorage.multiRemove(['token', 'user']);
      // L'app redirigera automatiquement vers login au prochain render
    }
    return Promise.reject(error);
  }
);

export default api;

