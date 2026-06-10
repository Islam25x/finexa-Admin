import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_UNAUTHORIZED_EVENT } from "../../infrastructure/api/http";
import {
  clearAuthSessionState,
  getAuthSessionSnapshot,
  initializeAuthSessionStore,
  setAuthSession,
  subscribeToAuthSession,
} from "../../infrastructure/auth/auth-session-store";
import { clearPersistedAuthState } from "../../infrastructure/auth/auth-storage";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  useEffect(() => {
    initializeAuthSessionStore();
  }, []);

  const session = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    () => null,
  );

  const login = useCallback((nextSession: NonNullable<AuthContextValue["session"]>) => {
    setAuthSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    await queryClient.cancelQueries();
    clearPersistedAuthState();
    clearAuthSessionState();
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleUnauthorized = () => {
      void logout();
    };

    window.addEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout]);

  const value: AuthContextValue = useMemo(() => ({
    session,
    isAuthenticated: session !== null,
    login,
    logout,
  }), [login, logout, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
