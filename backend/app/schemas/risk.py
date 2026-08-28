from pydantic import BaseModel
from datetime import datetime

class RiskScoreResponse(BaseModel):
    id: int
    vulnerability_id: int
    cvss_score: float
    epss_score: float
    kev_flag: bool
    composite_score: float
    computed_at: datetime

    class Config:
        from_attributes = True

class RiskWeightUpdate(BaseModel):
    weight_cvss: float
    weight_epss: float
    weight_kev: float
