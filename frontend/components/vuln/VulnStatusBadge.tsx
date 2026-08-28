import React from "react";
import { formatStatusColor } from "../../lib/utils";

interface VulnStatusBadgeProps {
  status: string;
}

export default function VulnStatusBadge({ status }: VulnStatusBadgeProps) {
  const formatted = status === "in_progress" ? "In Progress" : status?.toUpperCase();
  const colorClasses = formatStatusColor(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {formatted}
    </span>
  );
}
