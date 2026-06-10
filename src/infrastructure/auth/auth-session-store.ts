import type { AuthSession } from "./auth.types";
import {
  AUTH_STORAGE_KEY,
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "./auth-storage";

type AuthSessionListener = () => void;

let sessionSnapshot: AuthSession | null | undefined;
const listeners = new Set<AuthSessionListener>();
let hasStorageSync = false;

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function ensureSnapshot(): AuthSession | null {
  if (typeof sessionSnapshot === "undefined") {
    sessionSnapshot = readStoredAuthSession();
  }

  return sessionSnapshot;
}

export function getAuthSessionSnapshot(): AuthSession | null {
  return ensureSnapshot();
}

export function initializeAuthSessionStore(): void {
  ensureSnapshot();

  if (hasStorageSync || typeof window === "undefined") {
    return;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_STORAGE_KEY) {
      return;
    }

    sessionSnapshot = readStoredAuthSession();
    notifyListeners();
  };

  window.addEventListener("storage", handleStorage);
  hasStorageSync = true;
}

export function subscribeToAuthSession(listener: AuthSessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setAuthSession(session: AuthSession): void {
  sessionSnapshot = session;
  writeStoredAuthSession(session);
  notifyListeners();
}

export function patchAuthSession(
  updater: (currentSession: AuthSession | null) => AuthSession | null,
): void {
  const nextSession = updater(ensureSnapshot());

  if (nextSession) {
    sessionSnapshot = nextSession;
    writeStoredAuthSession(nextSession);
  } else {
    sessionSnapshot = null;
    clearStoredAuthSession();
  }

  notifyListeners();
}

export function clearAuthSessionState(): void {
  sessionSnapshot = null;
  clearStoredAuthSession();
  notifyListeners();
}
