from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.vulnerability import Vulnerability
from app.models.risk_score import RiskScore
from app.services.risk_scoring_service import calculate_composite_risk_score

router = APIRouter()

@router.post("/recompute")
async def recompute_risk_scores(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vulnerability).options(selectinload(Vulnerability.risk_score)))
    vulns = result.scalars().all()
    updated_count = 0

    for v in vulns:
        if v.risk_score:
            new_score = calculate_composite_risk_score(
                cvss_score=v.risk_score.cvss_score,
                epss_score=v.risk_score.epss_score,
                kev_flag=v.risk_score.kev_flag
            )
            v.risk_score.composite_score = new_score
            updated_count += 1

    await db.commit()
    return {
        "status": "success",
        "recomputed_count": updated_count,
        "message": f"Successfully recomputed composite risk scores for {updated_count} vulnerabilities."
    }
