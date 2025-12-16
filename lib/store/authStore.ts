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
        // Optimistic update
        set({
            user: null,
            profile: null,
            isLoggedIn: false
        });

        try {
            await logoutAction();
        } catch (error) {
            // Only log if it's not a redirect error (redirects serve as control flow)
            // In Next.js, redirects throw an error. We want that error to bubble up 
            // or at least we shouldn't suppress the redirect behavior. 
            // However, since we can't easily import isRedirectError here without adding dependencies,
            // we will let the error bubble up so Next.js handles the redirect.
            throw error;
        }
    },
}));
