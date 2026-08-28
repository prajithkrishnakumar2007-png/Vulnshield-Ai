from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse
from app.schemas.risk import RiskWeightUpdate
from app.core.config import settings

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/audit-logs")
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100))
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "timestamp": l.timestamp
        } for l in logs
    ]

@router.post("/risk-weights")
async def update_risk_weights(weights: RiskWeightUpdate):
    settings.WEIGHT_CVSS = weights.weight_cvss
    settings.WEIGHT_EPSS = weights.weight_epss
    settings.WEIGHT_KEV = weights.weight_kev
    return {
        "status": "success",
        "message": "Risk formula weights updated successfully.",
        "weights": {
            "weight_cvss": settings.WEIGHT_CVSS,
            "weight_epss": settings.WEIGHT_EPSS,
            "weight_kev": settings.WEIGHT_KEV
        }
    }
