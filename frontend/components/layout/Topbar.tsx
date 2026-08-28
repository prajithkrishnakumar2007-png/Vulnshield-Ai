"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Command, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface TopbarProps {
  onOpenCommandPalette?: () => void;
}

export default function Topbar({ onOpenCommandPalette }: TopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayName = user?.full_name || "Security Admin";
  const displayEmail = user?.email || "admin@vulnshield.ai";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 pl-64 fixed top-0 right-0 left-0 glass-panel border-b border-surface-border z-30 flex items-center justify-between px-6">
      {/* Search & Command Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface border border-surface-border text-gray-400 hover:text-white hover:border-cyan/30 text-xs transition-all w-72"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="flex-1 text-left">Search CVEs, assets, or rules...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Threat Level Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-alert/10 border border-alert/30 text-alert text-xs font-mono">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>
            Active Threats: <strong className="font-bold">5 KEV</strong>
          </span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-surface border border-surface-border text-gray-400 hover:text-white hover:border-cyan/30 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-alert absolute top-1.5 right-1.5"></span>
        </button>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan font-mono font-bold text-xs">
            {initials || "SA"}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-white">{displayName}</div>
            <div className="text-[10px] text-gray-400 font-mono">{displayEmail}</div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg bg-alert/10 border border-alert/30 text-alert hover:bg-alert/20 transition-all ml-1 glow-alert"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
