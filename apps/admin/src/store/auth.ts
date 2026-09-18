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
      // 1. Autenticar directamente en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const supabaseUser = authData.user;
      if (!supabaseUser) throw new Error('No se pudo obtener el usuario');

      // 2. Intentar traer datos extendidos del backend
      let orgId = 'org-demo-001';
      let orgName = 'FoodScreen Demo Org';
      let orgSlug = 'foodscreen-demo';
      try {
        const { data: orgData } = await api.get('/organizations/me');
        if (orgData?.id) orgId = orgData.id;
        if (orgData?.name) orgName = orgData.name;
        if (orgData?.slug) orgSlug = orgData.slug;
      } catch {
        console.warn('Backend API no disponible o respuesta incompleta, usando organización demo');
      }

      set({
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || email,
          name: supabaseUser.user_metadata?.name || email.split('@')[0],
          role: 'ADMIN',
          organization: {
            id: orgId,
            name: orgName,
            slug: orgSlug,
          },
        },
      });
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
      if (session?.user) {
        const supabaseUser = session.user;

        // Intentar enriquecer con datos del backend
        let orgId = 'org-demo-001';
        let orgName = 'FoodScreen Demo Org';
        let orgSlug = 'foodscreen-demo';
        try {
          const { data: orgData } = await api.get('/organizations/me');
          if (orgData?.id) orgId = orgData.id;
          if (orgData?.name) orgName = orgData.name;
          if (orgData?.slug) orgSlug = orgData.slug;
        } catch {
          console.warn('Backend API no disponible en initialize, usando organización demo');
        }

        set({
          user: {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Admin',
            role: 'ADMIN',
            organization: {
              id: orgId,
              name: orgName,
              slug: orgSlug,
            },
          },
        });
      }
    } catch (e) {
      console.error('Error al inicializar sesión', e);
    } finally {
      set({ initialized: true });
    }
  },
}));
