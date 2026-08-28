"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Vulnerability } from "../../lib/types";

interface SeverityBreakdownChartProps {
  vulnerabilities: Vulnerability[];
}

export default function SeverityBreakdownChart({ vulnerabilities }: SeverityBreakdownChartProps) {
  const counts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  vulnerabilities.forEach((v) => {
    const sev = v.raw_severity?.toUpperCase() || "MEDIUM";
    if (counts[sev] !== undefined) {
      counts[sev]++;
    } else {
      counts.MEDIUM++;
    }
  });

  const data = [
    { name: "Critical", value: counts.CRITICAL, color: "#FF3B5C" },
    { name: "High", value: counts.HIGH, color: "#FB923C" },
    { name: "Medium", value: counts.MEDIUM, color: "#FFB800" },
    { name: "Low", value: counts.LOW, color: "#00E5FF" }
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="glass-panel px-3 py-2 rounded-lg text-xs font-mono border border-cyan/30">
          <span style={{ color: d.payload.color }}>{d.name}:</span>{" "}
          <span className="font-bold text-white">{d.value} findings</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[260px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-gray-300 font-sans">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
