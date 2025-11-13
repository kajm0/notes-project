import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store state
    useAuthStore.setState({ user: null, token: null });
  });

  it('initializes with null user and token', () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('sets auth data correctly', () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'test-jwt-token';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const { user, token } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(token).toBe(mockToken);
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('clears auth data on logout', () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'test-jwt-token';

    // Set auth first
    useAuthStore.getState().setAuth(mockUser, mockToken);
    
    // Then logout
    useAuthStore.getState().logout();

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('does not set auth with invalid data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useAuthStore.getState().setAuth(null as any, null as any);

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid auth data');

    consoleSpy.mockRestore();
  });
});

