"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("analyst");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signup(fullName, email, password, role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Failed to sign up with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-cyan/30 glow-cyan space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center mx-auto glow-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-sans text-white">Create VulnShield Account</h1>
          <p className="text-xs text-gray-400 font-mono">Register new triage analyst credentials</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-alert/10 border border-alert/30 text-alert text-xs font-mono">
            {error}
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || submitting}
          className="w-full py-3 px-4 rounded-xl bg-surface border border-surface-border hover:border-cyan/50 text-white font-mono text-xs font-medium transition-all flex items-center justify-center gap-3 hover:bg-surface/80 group shadow-lg"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Or register with email</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-gray-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Levi Ackerman"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surface-border text-white focus:outline-none focus:border-cyan/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="levi@gmail.com"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surface-border text-white focus:outline-none focus:border-cyan/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surface-border text-white focus:outline-none focus:border-cyan/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-white focus:outline-none focus:border-cyan/50"
            >
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="w-full py-3 rounded-xl bg-cyan text-black font-bold font-mono text-xs hover:bg-cyan/90 glow-cyan transition-all flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? "Creating Account..." : "Complete Registration & Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 font-mono">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
