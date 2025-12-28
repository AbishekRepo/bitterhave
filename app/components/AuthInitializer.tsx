"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { createClient } from "@/lib/supabase/supabaseClient";

export default function AuthInitializer() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Initial check
        checkAuth();

        // Listen for auth changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                checkAuth();
            }
            if (event === 'SIGNED_OUT') {
                // We could call a reset action in the store if needed
                checkAuth(); // This will set user/profile to null in the store
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkAuth]);

    return null;
}
