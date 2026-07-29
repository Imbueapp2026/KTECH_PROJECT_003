"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/index";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Mark initial check as complete when loading finishes
    if (!loading) {
      setInitialCheckDone(true);
    }
  }, [loading]);

  useEffect(() => {
    // Only redirect after initial auth state check is complete
    if (initialCheckDone && !loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router, initialCheckDone]);

  // Show nothing while loading or if user is not authenticated after initial check
  if (loading || (!user && !initialCheckDone) || (!user && initialCheckDone)) {
    return null;
  }

  return <>{children}</>;
}