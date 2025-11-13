import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Note } from '../types';
import { offlineQueue, PendingOperation } from './offlineQueue';

interface AppState {
  user: User | null;
  token: string | null;
  notes: Note[];
  isOffline: boolean;
  isLoading: boolean;
  pendingOperationsCount: number;
  
  // Auth actions
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  
  // Notes actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  
  // Offline actions
  setOffline: (isOffline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Cache actions
  saveNotesToCache: () => Promise<void>;
  loadNotesFromCache: () => Promise<void>;
  
  // Queue actions
  syncPendingOperations: () => Promise<void>;
  updatePendingOperationsCount: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  notes: [],
  isOffline: false,
  isLoading: false,
  pendingOperationsCount: 0,

  setAuth: async (user, token) => {
    set({ user, token });
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  logout: async () => {
    set({ user: null, token: null, notes: [], pendingOperationsCount: 0 });
    await AsyncStorage.multiRemove(['token', 'user', 'notes_cache']);
    await offlineQueue.clearQueue();
  },

  loadAuth: async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['token', 'user']);
      if (token[1] && userStr[1]) {
        set({ token: token[1], user: JSON.parse(userStr[1]) });
      }
    } catch (error) {
      // Erreur silencieuse lors du chargement de l'auth
    }
  },

  setNotes: (notes) => set({ notes }),

  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),

  updateNote: (updatedNote) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),

  setOffline: (isOffline) => set({ isOffline }),

  setLoading: (isLoading) => set({ isLoading }),

  saveNotesToCache: async () => {
    const { notes } = get();
    try {
      await AsyncStorage.setItem('notes_cache', JSON.stringify(notes));
    } catch (error) {
      // Erreur silencieuse lors de la mise en cache
    }
  },

  loadNotesFromCache: async () => {
    try {
      const cached = await AsyncStorage.getItem('notes_cache');
      if (cached) {
        set({ notes: JSON.parse(cached) });
      }
    } catch (error) {
      // Erreur silencieuse lors du chargement du cache
    }
  },

  syncPendingOperations: async () => {
    const { isOffline, token } = get();
    if (isOffline || !token) {
      return;
    }

    const queue = await offlineQueue.getPendingOperations();
    if (queue.length === 0) {
      await get().updatePendingOperationsCount();
      return;
    }

    set({ isLoading: true });

    // Importer api dynamiquement pour éviter les dépendances circulaires
    const api = (await import('./api')).default;

    for (const operation of queue) {
      try {
        let response;
        
        switch (operation.method) {
          case 'POST':
            response = await api.post(operation.endpoint, operation.payload);
            // Pour CREATE, ajouter la note au store
            if (response.data) {
              get().addNote(response.data);
            }
            break;
          case 'PUT':
            response = await api.put(operation.endpoint, operation.payload);
            // Pour UPDATE, mettre à jour la note dans le store
            if (response.data) {
              get().updateNote(response.data);
            }
            break;
          case 'DELETE':
            await api.delete(operation.endpoint);
            // Pour DELETE, la note est déjà supprimée du store localement
            break;
        }

        // Opération réussie, la retirer de la queue
        await offlineQueue.removeOperation(operation.id);
      } catch (error: any) {
        // Si erreur d'authentification, arrêter la sync
        if (error.response?.status === 401 || error.response?.status === 403) {
          break;
        }
        
        // Marquer comme échouée (incrémente retries)
        await offlineQueue.markOperationFailed(operation.id);
      }
    }

    // Mettre à jour le cache après sync
    await get().saveNotesToCache();
    await get().updatePendingOperationsCount();
    set({ isLoading: false });
  },

  updatePendingOperationsCount: async () => {
    const count = await offlineQueue.getQueueLength();
    set({ pendingOperationsCount: count });
  },
}));

