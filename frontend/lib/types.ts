export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type VulnStatus = "open" | "in_progress" | "resolved";

export interface RiskScore {
  id: number;
  vulnerability_id: number;
  cvss_score: number;
  epss_score: number;
  kev_flag: boolean;
  composite_score: number;
  computed_at: string;
}

export interface Vulnerability {
  id: number;
  cve_id: string;
  title: string;
  description?: string;
  affected_asset: string;
  source_id?: number;
  raw_severity: Severity;
  status: VulnStatus;
  dedup_hash: string;
  first_seen_at: string;
  last_seen_at: string;
  risk_score?: RiskScore;
}

export interface VulnerabilityListResponse {
  items: Vulnerability[];
  total: number;
  open_count: number;
  critical_count: number;
  avg_risk_score: number;
}

export interface RemediationStep {
  step_number: number;
  title: string;
  command?: string;
  description: string;
}

export interface RemediationResponse {
  id: number;
  vulnerability_id: number;
  ai_summary: string;
  ai_fix_steps: RemediationStep[];
  ai_generated_at: string;
  applied_by?: number;
}

export interface ReasoningStep {
  step_number: number;
  title: string;
  reasoning: string;
  category: "EXPLOIT" | "EXPOSURE" | "BLAST_RADIUS" | "BUSINESS_CONTEXT";
}

export interface InvestigationTraceResponse {
  vulnerability_id: number;
  cve_id: string;
  composite_score: number;
  steps: ReasoningStep[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "analyst";
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  target_type?: string;
  target_id?: string;
  timestamp: string;
}

export interface Report {
  id: number;
  title: string;
  type: "compliance" | "mttr" | "summary";
  generated_by: number;
  payload_json: any;
  created_at: string;
}
