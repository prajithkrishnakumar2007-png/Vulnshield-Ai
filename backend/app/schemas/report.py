from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict

class ReportCreate(BaseModel):
    title: str
    type: str # compliance, mttr, summary

class ReportResponse(BaseModel):
    id: int
    title: str
    type: str
    generated_by: int
    payload_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
