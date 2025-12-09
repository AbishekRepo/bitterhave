import { create } from 'zustand';
import { createClient } from '@/lib/supabase/supabaseClient';
import { logout as logoutAction } from '@/lib/actions/auth';
import type { User } from '@supabase/supabase-js';



export interface UserProfile {
    id: string;
    email: string;
    fullName: string | null;
    avatar_url: string | null;
    sparks: number | null;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isLoggedIn: boolean;

    // Actions
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,

    setUser: (user) => set({
        user,
        isLoggedIn: !!user,
        isLoading: false
    }),

    checkAuth: async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            let profile: UserProfile | null = null;
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                profile = data;
            }

            set({
                user,
                profile,
                isLoggedIn: !!user,
                isLoading: false
            });
        } catch (error) {
            console.error('Error checking auth:', error);
            set({
                user: null,
                profile: null,
                isLoggedIn: false,
                isLoading: false
            });
        }
    },

    logout: async () => {
        try {
            await logoutAction();
            set({
                user: null,
                profile: null,
                isLoggedIn: false
            });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    },
}));
