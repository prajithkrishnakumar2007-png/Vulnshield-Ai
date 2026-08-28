from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.vulnerability import Vulnerability
from app.models.remediation import Remediation
from app.models.audit_log import AuditLog
from app.schemas.remediation import RemediationResponse
from app.services.ai_service import generate_ai_remediation

router = APIRouter()

@router.post("/{vuln_id}/generate", response_model=RemediationResponse)
async def generate_remediation(vuln_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vulnerability)
        .options(selectinload(Vulnerability.risk_score))
        .where(Vulnerability.id == vuln_id)
    )
    vuln = result.scalars().first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    cvss = vuln.risk_score.cvss_score if vuln.risk_score else 5.0
    epss = vuln.risk_score.epss_score if vuln.risk_score else 0.05
    kev = vuln.risk_score.kev_flag if vuln.risk_score else False

    # Generate via Claude / AI Service
    ai_result = await generate_ai_remediation(
        cve_id=vuln.cve_id,
        title=vuln.title,
        description=vuln.description or "",
        affected_asset=vuln.affected_asset,
        cvss_score=cvss,
        epss_score=epss,
        kev_flag=kev
    )

    remediation = Remediation(
        vulnerability_id=vuln.id,
        ai_summary=ai_result["ai_summary"],
        ai_fix_steps=ai_result["ai_fix_steps"]
    )
    db.add(remediation)
    await db.commit()
    await db.refresh(remediation)

    # Log audit action
    audit = AuditLog(action="GENERATE_AI_REMEDIATION", target_type="vulnerability", target_id=str(vuln_id))
    db.add(audit)
    await db.commit()

    return RemediationResponse.model_validate(remediation)
