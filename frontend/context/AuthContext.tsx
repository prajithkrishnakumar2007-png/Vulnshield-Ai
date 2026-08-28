"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { fetchApi } from "../lib/api";
import { User } from "../lib/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (fullName: string, email: string, password: string, role?: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  login: async () => { throw new Error("AuthProvider not found"); },
  signup: async () => { throw new Error("AuthProvider not found"); },
  signInWithGoogle: async () => { throw new Error("AuthProvider not found"); },
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial cached user from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vulnshield_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }

    // 2. Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          if (typeof window !== "undefined") {
            localStorage.setItem("vulnshield_token", idToken);
          }
          
          // Verify with backend or construct user profile
          try {
            const currentUser = await fetchApi<User>("/auth/me");
            setUser(currentUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("vulnshield_user", JSON.stringify(currentUser));
            }
          } catch {
            // Fallback to Firebase profile
            const fallbackUser: User = {
              id: 1,
              email: fbUser.email || "user@vulnshield.ai",
              full_name: fbUser.displayName || fbUser.email?.split("@")[0] || "Security Analyst",
              role: "admin",
              created_at: new Date().toISOString()
            };
            setUser(fallbackUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("vulnshield_user", JSON.stringify(fallbackUser));
            }
          }
        } catch (e) {
          console.error("Error setting up Firebase user session:", e);
        }
      } else {
        // If not in Firebase, check if local JWT exists
        const token = typeof window !== "undefined" ? localStorage.getItem("vulnshield_token") : null;
        if (token) {
          try {
            const currentUser = await fetchApi<User>("/auth/me");
            setUser(currentUser);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("vulnshield_token", res.access_token);
      localStorage.setItem("vulnshield_user", JSON.stringify(res.user));
    }
    setUser(res.user);
    return res.user;
  };

  const signup = async (fullName: string, email: string, password: string, role = "analyst") => {
    await fetchApi<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
    return await login(email, password);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    if (typeof window !== "undefined") {
      localStorage.setItem("vulnshield_token", idToken);
    }

    let appUser: User;
    try {
      // Register or fetch user from backend with Google token
      const res = await fetchApi<{ access_token: string; user: User }>("/auth/firebase-login", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken })
      });
      appUser = res.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("vulnshield_token", res.access_token || idToken);
      }
    } catch {
      // Fallback directly using Firebase identity
      appUser = {
        id: 1,
        email: result.user.email || "user@vulnshield.ai",
        full_name: result.user.displayName || "Google User",
        role: "admin",
        created_at: new Date().toISOString()
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("vulnshield_user", JSON.stringify(appUser));
    }
    setUser(appUser);
    return appUser;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("vulnshield_token");
      localStorage.removeItem("vulnshield_user");
    }
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, signup, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
