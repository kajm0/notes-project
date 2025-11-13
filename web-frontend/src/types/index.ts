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
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp: string;
}

