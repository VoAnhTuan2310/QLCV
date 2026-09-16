import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Safely parse initial user from localStorage
const getInitialUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: initialToken,
  isAuthenticated: Boolean(initialToken),

  setAuth: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
