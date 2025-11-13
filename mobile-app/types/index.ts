export interface User {
  id: string;
  email: string;
}

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  contentMd: string;
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface NotesResponse {
  content: Note[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

