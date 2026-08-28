"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Terminal, ShieldCheck } from "lucide-react";
import { RemediationStep } from "../../lib/types";

interface AIExplanationPanelProps {
  summary: string;
  steps: RemediationStep[];
  onGenerate?: () => void;
  loading?: boolean;
}

export default function AIExplanationPanel({ summary, steps, onGenerate, loading }: AIExplanationPanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-violet/30 glow-violet space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet/20 border border-violet/40 text-violet">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              Claude AI Remediation Intelligence
            </h3>
            <p className="text-xs text-gray-400 font-mono">LLM-assisted risk analysis & exact fix playbook</p>
          </div>
        </div>

        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet/20 hover:bg-violet/30 border border-violet/50 text-violet text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? "Analyzing..." : "Re-Generate Fix"}</span>
          </button>
        )}
      </div>

      {/* Plain English Summary */}
      <div className="bg-surface/80 p-4 rounded-lg border border-surface-border space-y-1">
        <div className="text-[11px] font-mono font-semibold text-cyan uppercase tracking-wider">
          Risk Executive Summary
        </div>
        <p className="text-xs text-gray-200 leading-relaxed font-sans">{summary}</p>
      </div>

      {/* Structured Fix Steps */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          Recommended Action Playbook ({steps.length} Steps)
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-surface p-4 rounded-lg border border-surface-border space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center text-[10px]">
                    {step.step_number || idx + 1}
                  </span>
                  <span>{step.title}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 pl-7">{step.description}</p>

              {step.command && (
                <div className="ml-7 mt-2 bg-black/70 p-2.5 rounded border border-white/10 font-mono text-xs text-cyan flex items-center justify-between group">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <Terminal className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <code>{step.command}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(step.command!, idx)}
                    className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                    title="Copy command"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
