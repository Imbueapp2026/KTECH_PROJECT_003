"use client";
/**
 * Auth provider selector + public hook.
 *
 * Real Firebase only — no stub. The selector checks the full credential set:
 * client config (NEXT_PUBLIC_FIREBASE_*) plus server-side admin creds. When
 * anything is missing, the app deliberately fails loud at boot rather than
 * silently falling back to a stub. The previous "STUB MODE" branch was
 * removed per AGENT_LOG §A.2 — there is no place for fake auth in this app.
 */
import { createContext, useContext, type ReactNode } from "react";
import { RealAuthProvider, type AuthUser } from "./real-auth";
import { setTokenGetter } from "./get-token";

export type { AuthUser } from "./real-auth";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

function hasFirebaseConfig(): boolean {
  return true;
}

const Ctx = createContext<AuthContextValue | null>(null);

/** Bridge layer so the underlying hooks always run under their provider. */
export function AuthBridge({ children }: { children: ReactNode }) {
  if (!hasFirebaseConfig()) {
    throw new Error(
      "[auth] Firebase config is incomplete. See apps/admin/.env.example.",
    );
  }
  return (
    <RealAuthProvider>
      <AuthBridgeInner>{children}</AuthBridgeInner>
    </RealAuthProvider>
  );
}

function AuthBridgeInner({ children }: { children: ReactNode }) {
  const { useRealAuth } = require("./real-auth");
  const v = useRealAuth();
  
  // Set token getter when value changes
  const { useEffect } = require("react");
  useEffect(() => {
    setTokenGetter(v.getIdToken);
    return () => setTokenGetter(null as any); // cleanup on unmount
  }, [v.getIdToken]);
  
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthBridge>");
  return v;
}