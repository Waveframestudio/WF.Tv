import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      // 1. Autenticar en Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Traer información extendida del backend NestJS
      const { data: userData } = await api.post('/auth/login', {
        email,
        password,
      });

      set({ user: userData.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Cargar datos de la org/usuario desde NestJS
        const { data: orgData } = await api.get('/organizations/me');
        // Para simplificar mapeamos de la respuesta
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          set({
            user: {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata.name || 'Admin',
              role: 'ADMIN',
              organization: orgData,
            },
          });
        }
      }
    } catch (e) {
      console.error('Error al inicializar sesión', e);
      await supabase.auth.signOut();
    } finally {
      set({ initialized: true });
    }
  },
}));
