"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", mttr: 12.4, target: 5.0 },
  { month: "Feb", mttr: 10.1, target: 5.0 },
  { month: "Mar", mttr: 8.5, target: 5.0 },
  { month: "Apr", mttr: 6.2, target: 5.0 },
  { month: "May", mttr: 4.8, target: 5.0 },
  { month: "Jun", mttr: 3.8, target: 5.0 }
];

export default function MTTRTrendChart() {
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="mttrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} unit="d" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0B0F19", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
          />
          <Area type="monotone" dataKey="mttr" stroke="#7C5CFF" strokeWidth={2.5} fillOpacity={1} fill="url(#mttrGradient)" name="MTTR (Days)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
