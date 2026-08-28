"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, AlertTriangle, UploadCloud, FileBarChart, Users, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdmin = user?.role === "admin";

  const allActions = [
    { title: "View Dashboard Overview", icon: Shield, path: "/dashboard", adminOnly: false },
    { title: "Triage Vulnerabilities Matrix", icon: AlertTriangle, path: "/vulnerabilities", adminOnly: false },
    { title: "Ingest Scanner Findings (Snyk / Nessus)", icon: UploadCloud, path: "/ingestion", adminOnly: false },
    { title: "Generate SOC2 & MTTR Reports", icon: FileBarChart, path: "/reports", adminOnly: false },
    { title: "Admin Settings & Risk Weights", icon: Users, path: "/admin", adminOnly: true },
  ];

  const actions = allActions
    .filter((a) => !a.adminOnly || isAdmin)
    .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl glass-panel rounded-xl border border-cyan/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-surface-border">
          <Search className="w-5 h-5 text-cyan mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {actions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500 font-mono">No matching commands found.</div>
          ) : (
            actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.path}
                  onClick={() => handleSelect(act.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-gray-300 hover:text-cyan hover:bg-cyan/10 transition-all text-left font-medium"
                >
                  <Icon className="w-4 h-4 text-cyan" />
                  <span>{act.title}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-surface/50 border-t border-surface-border flex justify-between items-center text-[10px] font-mono text-gray-500">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
