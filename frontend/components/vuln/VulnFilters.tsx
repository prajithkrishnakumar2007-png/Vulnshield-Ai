"use client";

import React from "react";
import { Search, Zap, Filter } from "lucide-react";

interface VulnFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity: string;
  onSeverityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  kevOnly: boolean;
  onKevToggle: () => void;
}

export default function VulnFilters({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  kevOnly,
  onKevToggle
}: VulnFiltersProps) {
  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CVE ID, asset, title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-surface-border text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan/50 font-sans"
          />
        </div>

        {/* Filters Right */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* CISA KEV Filter Toggle */}
          <button
            onClick={onKevToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              kevOnly
                ? "bg-alert/20 text-alert border-alert/50 glow-alert"
                : "bg-surface text-gray-400 border-surface-border hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>CISA KEV ONLY</span>
          </button>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface border border-surface-border px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-surface text-white">All Statuses</option>
              <option value="open" className="bg-surface text-white">Open</option>
              <option value="in_progress" className="bg-surface text-white">In Progress</option>
              <option value="resolved" className="bg-surface text-white">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-2 pt-2 border-t border-surface-border">
        <span className="text-[11px] text-gray-400 font-mono mr-2">Severity:</span>
        {severities.map((sev) => (
          <button
            key={sev}
            onClick={() => onSeverityChange(sev === "ALL" ? "" : sev)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all border ${
              (sev === "ALL" && !severity) || severity === sev
                ? "bg-cyan/15 text-cyan border-cyan/40"
                : "bg-surface text-gray-400 border-surface-border hover:text-white"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>
    </div>
  );
}
