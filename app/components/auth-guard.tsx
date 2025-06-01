import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
import supabase from '~/lib/supabase.client';
import type { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      // If no user and not on auth pages, redirect to sign in
      if (!session?.user && !location.pathname.startsWith('/auth/')) {
        navigate(`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, redirect to intended page or stay on current page
          const params = new URLSearchParams(location.search);
          const redirectTo = params.get('redirectTo');
          if (redirectTo) {
            navigate(redirectTo);
          }
          // Don't auto-redirect if already on a valid page
        } else if (event === 'SIGNED_OUT') {
          // User signed out, redirect to home
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !location.pathname.startsWith('/auth/')) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
} 