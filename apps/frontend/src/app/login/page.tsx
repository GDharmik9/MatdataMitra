"use client";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const user = await signInWithGoogle();
    if (user) router.push("/");
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-icon">🗳️</span>
        <h1>Welcome to MatdataMitra</h1>
        <p>Sign in to access your personalized electoral assistant</p>
        <button className="btn btn-google" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? "Signing in..." : "🔐 Sign in with Google"}
        </button>
        <p className="login-footer">Your data is secure and never shared with third parties.</p>
      </div>
    </div>
  );
}
