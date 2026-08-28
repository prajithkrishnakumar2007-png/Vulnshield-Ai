"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";
import { Vulnerability } from "../../lib/types";

interface RiskScatterChartProps {
  vulnerabilities: Vulnerability[];
}

export default function RiskScatterChart({ vulnerabilities }: RiskScatterChartProps) {
  const chartData = vulnerabilities.map((v) => ({
    id: v.id,
    cve_id: v.cve_id,
    title: v.title,
    asset: v.affected_asset,
    cvss: v.risk_score?.cvss_score || 0,
    epss: ((v.risk_score?.epss_score || 0) * 100).toFixed(1),
    epssRaw: v.risk_score?.epss_score || 0,
    composite: v.risk_score?.composite_score || 0,
    kev: v.risk_score?.kev_flag || false,
    severity: v.raw_severity
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-lg border border-cyan/30 text-xs shadow-xl space-y-1 z-50">
          <div className="font-mono text-cyan font-bold text-sm">{d.cve_id}</div>
          <div className="font-medium text-white truncate max-w-[220px]">{d.title}</div>
          <div className="text-gray-400">Asset: <span className="text-gray-200 font-mono">{d.asset}</span></div>
          <div className="flex gap-3 pt-1 border-t border-white/10 font-mono">
            <div>CVSS: <span className="text-white font-bold">{d.cvss}</span></div>
            <div>EPSS: <span className="text-white font-bold">{d.epss}%</span></div>
            <div>Composite: <span className="text-cyan font-bold">{d.composite}</span></div>
          </div>
          {d.kev && (
            <div className="text-alert font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 pt-1">
              <span>⚡ CISA KEV Active Exploitation</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            dataKey="cvss"
            name="CVSS Score"
            domain={[0, 10]}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            tickLine={{ stroke: "#374151" }}
            label={{ value: "CVSS Severity Score (0-10)", position: "bottom", fill: "#6B7280", fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="epssRaw"
            name="EPSS Score"
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            tickLine={{ stroke: "#374151" }}
            label={{ value: "EPSS Exploit Probability", angle: -90, position: "left", fill: "#6B7280", fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="composite" range={[100, 500]} name="Composite Risk" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={chartData}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.kev ? "#FF3B5C" : entry.composite > 75 ? "#FFB800" : "#00E5FF"}
                opacity={0.85}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
