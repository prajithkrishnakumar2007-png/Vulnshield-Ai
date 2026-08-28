"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, ShieldAlert, Network, Building2, CheckCircle2 } from "lucide-react";
import { ReasoningStep } from "../../lib/types";

interface ReasoningTraceProps {
  steps: ReasoningStep[];
  loading?: boolean;
}

export default function ReasoningTrace({ steps, loading }: ReasoningTraceProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "EXPLOIT":
        return ShieldAlert;
      case "EXPOSURE":
        return Network;
      case "BLAST_RADIUS":
        return Cpu;
      case "BUSINESS_CONTEXT":
        return Building2;
      default:
        return Terminal;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "EXPLOIT":
        return "text-alert border-alert/30 bg-alert/10";
      case "EXPOSURE":
        return "text-warning border-warning/30 bg-warning/10";
      case "BLAST_RADIUS":
        return "text-violet border-violet/30 bg-violet/10";
      case "BUSINESS_CONTEXT":
        return "text-cyan border-cyan/30 bg-cyan/10";
      default:
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-cyan/30 glow-cyan space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan/20 border border-cyan/40 text-cyan">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Investigation Agent Reasoning Trace
            </h3>
            <p className="text-xs text-gray-400 font-mono">Chain-of-thought analysis explaining risk priority ranking</p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-success flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 border border-success/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Chain Verified</span>
        </div>
      </div>

      {/* Vertical Animated Step Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan before:via-violet before:to-alert">
        {steps.map((step, idx) => {
          const Icon = getCategoryIcon(step.category);
          const badgeClass = getCategoryColor(step.category);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.3 }}
              className="relative bg-surface p-4 rounded-lg border border-surface-border space-y-2"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-background border-2 border-cyan glow-cyan flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white"></span>
              </div>

              {/* Step Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                  <span className="text-cyan">Step {step.step_number || idx + 1}:</span>
                  <span>{step.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}`}>
                  {step.category}
                </span>
              </div>

              {/* Reasoning Details */}
              <p className="text-xs text-gray-300 font-sans leading-relaxed pl-1">{step.reasoning}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
