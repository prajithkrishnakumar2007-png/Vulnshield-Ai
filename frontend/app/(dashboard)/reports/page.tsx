"use client";

import React, { useState, useEffect } from "react";
import { FileBarChart, Download, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { fetchApi } from "../../../lib/api";
import { Report } from "../../../lib/types";
import MTTRTrendChart from "../../../components/charts/MTTRTrendChart";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Report[]>("/reports/");
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateReport = async (type: "compliance" | "mttr") => {
    setGenerating(true);
    try {
      await fetchApi<Report>("/reports/generate", {
        method: "POST",
        body: JSON.stringify({
          title: type === "compliance" ? "SOC2 & ISO 27001 Audit Report" : "MTTR Resolution Report",
          type
        })
      });
      loadReports();
    } finally {
      setGenerating(false);
    }
  };

  const downloadReportJson = (report: Report) => {
    const jsonStr = JSON.stringify(report.payload_json, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VulnShield_${report.type}_${report.id}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-cyan" />
            Compliance & MTTR Reports Engine
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Generate downloadable SOC2/ISO audit packages and SLA resolution metrics
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleGenerateReport("compliance")}
            disabled={generating}
            className="px-4 py-2 rounded-xl bg-violet/20 border border-violet/40 hover:bg-violet/30 text-violet text-xs font-mono font-bold transition-all glow-violet disabled:opacity-50"
          >
            + Generate Compliance Report
          </button>
          <button
            onClick={() => handleGenerateReport("mttr")}
            disabled={generating}
            className="px-4 py-2 rounded-xl bg-cyan/20 border border-cyan/40 hover:bg-cyan/30 text-cyan text-xs font-mono font-bold transition-all glow-cyan disabled:opacity-50"
          >
            + Generate MTTR Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Mean Time To Remediate (MTTR)</span>
            <Clock className="w-4 h-4 text-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-cyan font-mono">3.8 Days</div>
          <div className="text-[11px] text-success font-mono">↓ 24% improvement vs Q1</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>SLA Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-success" />
          </div>
          <div className="text-3xl font-extrabold text-success font-mono">94.2%</div>
          <div className="text-[11px] text-gray-400 font-mono">Critical SLA: &lt; 24h</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Audit Readiness Score</span>
            <CheckCircle2 className="w-4 h-4 text-violet" />
          </div>
          <div className="text-3xl font-extrabold text-violet font-mono">94.5 / 100</div>
          <div className="text-[11px] text-violet font-mono">SOC2 & ISO 27001 Ready</div>
        </div>
      </div>

      {/* MTTR Trend Chart */}
      <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-4">
        <div className="border-b border-surface-border pb-3">
          <h3 className="text-sm font-bold text-white font-sans">MTTR Reduction Trend (6 Months)</h3>
          <p className="text-[11px] text-gray-400 font-mono font-normal">Average resolution time in days</p>
        </div>
        <MTTRTrendChart />
      </div>

      {/* Report History Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-border space-y-4 p-6">
        <h3 className="text-sm font-bold text-white font-sans border-b border-surface-border pb-3">
          Generated Report History ({reports.length})
        </h3>

        {loading ? (
          <div className="text-center text-xs font-mono text-cyan py-6">Loading report history...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-xs font-mono text-gray-500 py-6">
            No reports generated yet. Click above to generate an audit report.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-surface p-4 rounded-xl border border-surface-border flex items-center justify-between hover:border-cyan/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan/10 text-cyan border border-cyan/30">
                    <FileBarChart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-sans">{r.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Type: {r.type.toUpperCase()} | Generated: {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => downloadReportJson(r)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-cyan/40 text-cyan text-xs font-mono transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
