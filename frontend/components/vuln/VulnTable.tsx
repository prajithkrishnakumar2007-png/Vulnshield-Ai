"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Zap, ChevronRight, ArrowUpDown } from "lucide-react";
import { Vulnerability, VulnStatus } from "../../lib/types";
import VulnStatusBadge from "./VulnStatusBadge";
import RiskScoreGauge from "./RiskScoreGauge";
import { formatSeverityColor } from "../../lib/utils";

interface VulnTableProps {
  vulnerabilities: Vulnerability[];
  onStatusChange: (id: number, status: VulnStatus) => void;
}

export default function VulnTable({ vulnerabilities, onStatusChange }: VulnTableProps) {
  if (vulnerabilities.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-xl border border-surface-border">
        <div className="text-gray-500 font-mono text-sm mb-2">No matching vulnerabilities found.</div>
        <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-surface-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/80 border-b border-surface-border text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">CVE / Vulnerability</th>
              <th className="py-3.5 px-4 font-semibold">Affected Asset</th>
              <th className="py-3.5 px-4 font-semibold">Severity</th>
              <th className="py-3.5 px-4 font-semibold">Risk Score</th>
              <th className="py-3.5 px-4 font-semibold">EPSS / KEV</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-xs">
            {vulnerabilities.map((v) => {
              const compScore = v.risk_score?.composite_score || 0;
              const epssPct = ((v.risk_score?.epss_score || 0) * 100).toFixed(1);
              const isKev = v.risk_score?.kev_flag || false;

              return (
                <tr
                  key={v.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* CVE & Title */}
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/vulnerabilities/${v.id}`}
                        className="font-mono text-cyan font-bold hover:underline flex items-center gap-1"
                      >
                        {v.cve_id}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    <div className="text-gray-300 truncate mt-0.5 font-medium">{v.title}</div>
                  </td>

                  {/* Asset */}
                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    <span className="px-2 py-1 rounded bg-surface border border-surface-border">
                      {v.affected_asset}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${formatSeverityColor(
                        v.raw_severity
                      )}`}
                    >
                      {v.raw_severity}
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4">
                    <RiskScoreGauge score={compScore} />
                  </td>

                  {/* EPSS / KEV */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-gray-300">{epssPct}%</div>
                    {isKev && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-alert font-bold uppercase tracking-wider mt-0.5">
                        <Zap className="w-3 h-3 fill-current animate-pulse" /> KEV ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={v.status}
                      onChange={(e) => onStatusChange(v.id, e.target.value as VulnStatus)}
                      className="bg-surface border border-surface-border text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan/50 cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/vulnerabilities/${v.id}`}
                      className="inline-flex items-center gap-1 text-cyan hover:text-white font-mono text-xs font-semibold hover:underline"
                    >
                      Remediate <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
