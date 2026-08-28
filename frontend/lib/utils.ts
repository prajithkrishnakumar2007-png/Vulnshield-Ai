import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeverityColor(severity: string): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "text-alert border-alert/30 bg-alert/10";
    case "HIGH":
      return "text-orange-400 border-orange-400/30 bg-orange-400/10";
    case "MEDIUM":
      return "text-warning border-warning/30 bg-warning/10";
    case "LOW":
      return "text-cyan border-cyan/30 bg-cyan/10";
    default:
      return "text-gray-400 border-gray-400/30 bg-gray-400/10";
  }
}

export function formatStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "open":
      return "text-alert border-alert/40 bg-alert/10";
    case "in_progress":
      return "text-warning border-warning/40 bg-warning/10";
    case "resolved":
      return "text-success border-success/40 bg-success/10";
    default:
      return "text-gray-400 border-gray-400/40 bg-gray-400/10";
  }
}
