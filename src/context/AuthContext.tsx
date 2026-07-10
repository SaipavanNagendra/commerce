import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useProfile } from '../hooks/useUser';
import type { User } from '../types/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../hooks/useAuth';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useProfile();
  const queryClient = useQueryClient();

  useEffect(() => {
    // ── bfcache restore ──────────────────────────────────
    // When the browser restores a page from the back-forward cache it
    // shows the exact frozen snapshot — including any credentials that
    // were on screen.  Hide the body *immediately* so nothing flashes,
    // then reload to force a fresh auth check.
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        document.body.style.visibility = 'hidden';
        window.location.reload();
      }
    }

    // ── tab refocus ──────────────────────────────────────
    // If the user logged out in another tab, coming back to this one
    // should re-check the session so ProtectedRoute can redirect.
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: authKeys.profile });
      }
    }

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !isError && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}