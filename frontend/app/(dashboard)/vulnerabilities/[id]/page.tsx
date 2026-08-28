"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Zap, Shield, Sparkles, Cpu, CheckCircle2 } from "lucide-react";
import { fetchApi } from "../../../../lib/api";
import { Vulnerability, RemediationResponse, InvestigationTraceResponse, VulnStatus } from "../../../../lib/types";
import VulnStatusBadge from "../../../../components/vuln/VulnStatusBadge";
import RiskScoreGauge from "../../../../components/vuln/RiskScoreGauge";
import AIExplanationPanel from "../../../../components/vuln/AIExplanationPanel";
import ReasoningTrace from "../../../../components/vuln/ReasoningTrace";
import { formatSeverityColor } from "../../../../lib/utils";

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const vulnId = params?.id;

  const [vuln, setVuln] = useState<Vulnerability | null>(null);
  const [remediation, setRemediation] = useState<RemediationResponse | null>(null);
  const [agentTrace, setAgentTrace] = useState<InvestigationTraceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [runningAgent, setRunningAgent] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!vulnId) return;
      setLoading(true);
      try {
        const v = await fetchApi<Vulnerability>(`/vulnerabilities/${vulnId}`);
        setVuln(v);

        // Try generating initial AI remediation & agent trace
        try {
          const rem = await fetchApi<RemediationResponse>(`/remediation/${vulnId}/generate`, { method: "POST" });
          setRemediation(rem);
        } catch (e) {}

        try {
          const trace = await fetchApi<InvestigationTraceResponse>(`/agent/${vulnId}/investigate`, { method: "POST" });
          setAgentTrace(trace);
        } catch (e) {}

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vulnId]);

  const handleGenerateAi = async () => {
    if (!vulnId) return;
    setGeneratingAi(true);
    try {
      const rem = await fetchApi<RemediationResponse>(`/remediation/${vulnId}/generate`, { method: "POST" });
      setRemediation(rem);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleRunAgent = async () => {
    if (!vulnId) return;
    setRunningAgent(true);
    try {
      const trace = await fetchApi<InvestigationTraceResponse>(`/agent/${vulnId}/investigate`, { method: "POST" });
      setAgentTrace(trace);
    } finally {
      setRunningAgent(false);
    }
  };

  const handleStatusChange = async (newStatus: VulnStatus) => {
    if (!vuln) return;
    setVuln({ ...vuln, status: newStatus });
    await fetchApi(`/vulnerabilities/${vuln.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    });
  };

  if (loading) {
    return <div className="glass-panel p-12 text-center text-xs font-mono text-cyan">Loading vulnerability details...</div>;
  }

  if (!vuln) {
    return <div className="glass-panel p-12 text-center text-xs font-mono text-alert">Vulnerability not found.</div>;
  }

  const compScore = vuln.risk_score?.composite_score || 0;
  const cvss = vuln.risk_score?.cvss_score || 0;
  const epssPct = ((vuln.risk_score?.epss_score || 0) * 100).toFixed(1);
  const isKev = vuln.risk_score?.kev_flag || false;

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="space-y-4">
        <Link
          href="/vulnerabilities"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Triage Matrix
        </Link>

        <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-mono text-cyan">{vuln.cve_id}</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${formatSeverityColor(vuln.raw_severity)}`}>
                  {vuln.raw_severity}
                </span>
                <VulnStatusBadge status={vuln.status} />
              </div>
              <h1 className="text-xl font-bold font-sans text-white">{vuln.title}</h1>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-gray-400">Update Status:</label>
              <select
                value={vuln.status}
                onChange={(e) => handleStatusChange(e.target.value as VulnStatus)}
                className="bg-surface border border-cyan/40 text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-sans">{vuln.description}</p>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-border font-mono">
            <div>
              <div className="text-gray-400 text-[10px]">Affected Asset</div>
              <div className="text-white font-bold text-xs truncate">{vuln.affected_asset}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">CVSS Base Score</div>
              <div className="text-white font-bold text-xs">{cvss} / 10</div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">EPSS Exploit Prob.</div>
              <div className="text-cyan font-bold text-xs">{epssPct}%</div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">CISA KEV Status</div>
              <div className={`font-bold text-xs ${isKev ? "text-alert flex items-center gap-1" : "text-gray-400"}`}>
                {isKev ? <><Zap className="w-3 h-3 animate-pulse" /> Active</> : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composite Risk Score Banner */}
      <div className="glass-panel p-6 rounded-xl border border-cyan/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <RiskScoreGauge score={compScore} />
          <div>
            <div className="text-xs font-mono text-gray-400">Calculated Composite Risk Score</div>
            <div className="text-lg font-bold text-white font-sans">
              Score: <span className="text-cyan font-mono">{compScore} / 100</span>
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono text-gray-400 hidden sm:block">
          <div>Formula: (0.4 * CVSS*10) + (0.4 * EPSS*100) + (0.2 * KEV)</div>
          <div className="text-cyan">Auto-recomputed on threat feed update</div>
        </div>
      </div>

      {/* Main Content Grid: AI Remediation & Investigation Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Claude AI Remediation Playbook */}
        <div className="lg:col-span-7">
          <AIExplanationPanel
            summary={remediation?.ai_summary || "Click generate to obtain Claude AI fix steps."}
            steps={remediation?.ai_fix_steps || []}
            onGenerate={handleGenerateAi}
            loading={generatingAi}
          />
        </div>

        {/* Right Column: Multi-Step Agent Reasoning Trace */}
        <div className="lg:col-span-5">
          <ReasoningTrace
            steps={agentTrace?.steps || []}
            loading={runningAgent}
          />
        </div>
      </div>
    </div>
  );
}
