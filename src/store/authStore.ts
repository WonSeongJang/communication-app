import { create } from 'zustand';
import { supabase, type User } from '@/lib/supabase';
import type { AuthState } from '@/types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setSession: (session) => set({ session }),

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Fetch user profile data from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        set({
          user: userData,
          session,
          isAuthenticated: true,
        });
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  },
}));
