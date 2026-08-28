"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AlertTriangle, Zap, Shield, RefreshCw, ArrowUpRight } from "lucide-react";
import { useVulnerabilities } from "../../../hooks/useVulnerabilities";
import { useRiskScore } from "../../../hooks/useRiskScore";
import RiskScatterChart from "../../../components/charts/RiskScatterChart";
import SeverityBreakdownChart from "../../../components/charts/SeverityBreakdownChart";
import VulnTable from "../../../components/vuln/VulnTable";

const RiskOrb = dynamic(() => import("../../../components/three/RiskOrb"), {
  ssr: false,
  loading: () => <div className="w-24 h-24 rounded-full bg-cyan/10 border border-cyan/30 animate-pulse" />
});

export default function DashboardPage() {
  const { data, loading, refresh, updateStatus } = useVulnerabilities();
  const { recomputing, recomputeScores } = useRiskScore();

  const handleRecompute = async () => {
    await recomputeScores();
    refresh();
  };

  const vulns = data?.items || [];
  const openCount = data?.open_count || 0;
  const criticalCount = data?.critical_count || 0;
  const avgRisk = data?.avg_risk_score || 0;
  const kevCount = vulns.filter(v => v.risk_score?.kev_flag).length;

  return (
    <div className="space-y-8">
      {/* Header Banner with 3D RiskOrb */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/30 glow-cyan flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <RiskOrb score={avgRisk} />
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan bg-cyan/10 px-2.5 py-1 rounded border border-cyan/30 mb-2">
              <Shield className="w-3.5 h-3.5" /> SECURITY OPS CENTER ACTIVE
            </div>
            <h1 className="text-2xl font-bold font-sans text-white">
              Vulnerability Prioritization Matrix
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Composite Risk Formula: <span className="text-gray-200">0.4*CVSS + 0.4*EPSS + 0.2*KEV</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRecompute}
          disabled={recomputing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-cyan/40 hover:border-cyan text-cyan font-mono text-xs font-bold transition-all glow-cyan disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${recomputing ? "animate-spin" : ""}`} />
          <span>{recomputing ? "Recomputing..." : "Recompute Risk Scores"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Open Findings</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{loading ? "..." : openCount}</div>
          <div className="text-[11px] text-gray-500 font-mono">Requires triage review</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-alert/30 space-y-2">
          <div className="flex items-center justify-between text-alert text-xs font-mono">
            <span>Critical Severity</span>
            <span className="w-2 h-2 rounded-full bg-alert animate-ping"></span>
          </div>
          <div className="text-3xl font-extrabold text-alert font-mono">{loading ? "..." : criticalCount}</div>
          <div className="text-[11px] text-gray-400 font-mono">High breach impact</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-cyan/30 space-y-2">
          <div className="flex items-center justify-between text-cyan text-xs font-mono">
            <span>Average Composite Risk</span>
            <Shield className="w-4 h-4 text-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-cyan font-mono">{loading ? "..." : `${avgRisk} / 100`}</div>
          <div className="text-[11px] text-gray-400 font-mono">Weighted environmental score</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-alert/30 space-y-2">
          <div className="flex items-center justify-between text-alert text-xs font-mono">
            <span>CISA KEV Exploited</span>
            <Zap className="w-4 h-4 text-alert" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{loading ? "..." : kevCount}</div>
          <div className="text-[11px] text-alert font-mono font-bold">Active in-the-wild attacks</div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Scatter (EPSS vs CVSS, size = composite) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Priority Scatter Matrix (EPSS vs CVSS)</h3>
              <p className="text-[11px] text-gray-400 font-mono">Bubble size = Composite Score | Color = CISA KEV Status</p>
            </div>
            <span className="text-[10px] font-mono text-cyan border border-cyan/30 px-2 py-0.5 rounded bg-cyan/10">
              Interactive 2D Matrix
            </span>
          </div>
          <RiskScatterChart vulnerabilities={vulns} />
        </div>

        {/* Severity Breakdown Donut */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-xl border border-surface-border space-y-4">
          <div className="border-b border-surface-border pb-3">
            <h3 className="text-sm font-bold text-white font-sans">Severity Distribution</h3>
            <p className="text-[11px] text-gray-400 font-mono">Active vulnerability counts</p>
          </div>
          <SeverityBreakdownChart vulnerabilities={vulns} />
        </div>
      </div>

      {/* Triage Matrix Table Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-sans text-white flex items-center gap-2">
            Top Priority Vulnerabilities
          </h2>
          <Link
            href="/vulnerabilities"
            className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
          >
            View Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-xs font-mono text-cyan">Loading vulnerability findings...</div>
        ) : (
          <VulnTable vulnerabilities={vulns.slice(0, 5)} onStatusChange={updateStatus} />
        )}
      </div>
    </div>
  );
}
