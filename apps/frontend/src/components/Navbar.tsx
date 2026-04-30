"use client";
import { useEffect, useState } from "react";
import { onAuthChange, signOut } from "@/lib/firebase";
import type { User } from "@/lib/firebase";
import GoogleTranslate from "./GoogleTranslate";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="navbar">
      <a href="/" className="nav-brand">
        <img src="/images/logo_mitra.png" alt="Logo" className="nav-logo" />
        <span className="nav-title">MatdataMitra</span>
      </a>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/forms">Forms</a>
        <a href="/guidelines">Guidelines</a>
        <a href="/updates">Updates</a>

        {/* Language Translator */}
        <div className="nav-translator">
          <GoogleTranslate />
        </div>

        {loading ? (
          <span className="nav-loading">...</span>
        ) : user ? (
          <div className="nav-user-menu">
            <span className="nav-user-name">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="nav-avatar" />
              ) : (
                "👤"
              )}
              {user.displayName?.split(" ")[0] || "User"}
            </span>
            <button onClick={() => signOut()} className="nav-logout">
              Sign out
            </button>
          </div>
        ) : (
          <a href="/login" className="nav-login">Login</a>
        )}
      </div>
    </nav>
  );
}
