import React from "react";

interface RiskScoreGaugeProps {
  score: number;
}

export default function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const rounded = Math.round(score * 10) / 10;
  
  const getColor = (s: number) => {
    if (s >= 75) return "text-alert stroke-alert";
    if (s >= 45) return "text-warning stroke-warning";
    return "text-cyan stroke-cyan";
  };

  const colorClass = getColor(rounded);

  return (
    <div className="flex items-center gap-2 font-mono">
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-800 stroke-current"
            strokeWidth="3.5"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeDasharray={`${rounded}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-white">{rounded}</span>
      </div>
    </div>
  );
}
