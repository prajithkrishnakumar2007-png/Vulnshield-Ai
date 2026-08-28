from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class RemediationFixStep(BaseModel):
    step_number: int
    title: str
    command: Optional[str] = None
    description: str

class RemediationResponse(BaseModel):
    id: int
    vulnerability_id: int
    ai_summary: str
    ai_fix_steps: Any
    ai_generated_at: datetime
    applied_by: Optional[int] = None

    class Config:
        from_attributes = True

class ReasoningStep(BaseModel):
    step_number: int
    title: str
    reasoning: str
    category: str # "EXPLOIT", "EXPOSURE", "BLAST_RADIUS", "BUSINESS_CONTEXT"

class InvestigationTraceResponse(BaseModel):
    vulnerability_id: int
    cve_id: str
    composite_score: float
    steps: List[ReasoningStep]
