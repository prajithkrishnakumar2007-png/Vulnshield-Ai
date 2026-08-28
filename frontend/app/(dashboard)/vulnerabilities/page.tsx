"use client";

import React, { useState } from "react";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { useVulnerabilities } from "../../../hooks/useVulnerabilities";
import VulnFilters from "../../../components/vuln/VulnFilters";
import VulnTable from "../../../components/vuln/VulnTable";

export default function VulnerabilitiesPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [kevOnly, setKevOnly] = useState(false);

  const { data, loading, refresh, updateStatus } = useVulnerabilities({
    search,
    severity,
    status,
    kev_only: kevOnly
  });

  const vulns = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-cyan" />
            Vulnerability Triage Matrix
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Filter, search, and manage lifecycle status across ingested scanner findings
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-surface-border hover:border-cyan/30 text-gray-300 hover:text-white text-xs font-mono transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Filters Component */}
      <VulnFilters
        search={search}
        onSearchChange={setSearch}
        severity={severity}
        onSeverityChange={setSeverity}
        status={status}
        onStatusChange={setStatus}
        kevOnly={kevOnly}
        onKevToggle={() => setKevOnly(!kevOnly)}
      />

      {/* Table */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-xs font-mono text-cyan">
          Loading vulnerabilities matrix...
        </div>
      ) : (
        <VulnTable vulnerabilities={vulns} onStatusChange={updateStatus} />
      )}
    </div>
  );
}
