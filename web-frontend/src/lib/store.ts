import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser && storedToken ? JSON.parse(storedUser) : null,
  token: storedToken,
  setAuth: (user, token) => {
    if (!user || !token) {
      console.error('Invalid auth data');
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    set({ user: null, token: null });
  },
}));

interface Note {
  id: string;
  title: string;
  contentMd: string;
  tags: string[];
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Note) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, note) => set((state) => ({
    notes: state.notes.map((n) => n.id === id ? note : n),
  })),
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((n) => n.id !== id),
  })),
}));


