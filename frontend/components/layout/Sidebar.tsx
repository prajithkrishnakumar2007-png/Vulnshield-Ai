"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  UploadCloud,
  FileBarChart,
  Users,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Triage Matrix", path: "/vulnerabilities", icon: AlertTriangle },
  { name: "Data Ingestion", path: "/ingestion", icon: UploadCloud },
  { name: "Reports & MTTR", path: "/reports", icon: FileBarChart },
  { name: "Admin Control", path: "/admin", icon: Users, adminOnly: true }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-surface-border flex flex-col justify-between z-40">
      <div>
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-surface-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan glow-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base font-sans flex items-center gap-1.5">
              VulnShield <span className="text-cyan text-xs font-mono px-1.5 py-0.5 rounded bg-cyan/10 border border-cyan/30">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Prioritization & Remediation</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 mt-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-cyan/10 text-cyan border border-cyan/30 glow-cyan"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-cyan" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status & Logout Footer */}
      <div className="p-4 border-t border-surface-border space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-alert/10 border border-alert/30 text-alert hover:bg-alert/20 font-mono text-xs font-bold transition-all glow-alert"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-gray-300 text-[11px]">Engine Active</span>
          </div>
          <span className="text-[10px] text-gray-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
