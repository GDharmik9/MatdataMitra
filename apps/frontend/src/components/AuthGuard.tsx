// ============================================================
// MatdataMitra Frontend — Auth Guard Component
// Wraps pages that require authentication
// ============================================================

"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, User } from "@/lib/firebase";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.push("/login");
      }
    });
    return unsubscribe;
  }, [router]);

  if (loading) {
    return (
      fallback ?? (
        <div className="auth-loading">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      )
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
