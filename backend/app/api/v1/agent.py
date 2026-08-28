from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.vulnerability import Vulnerability
from app.models.reasoning_trace import ReasoningTrace
from app.models.audit_log import AuditLog
from app.schemas.remediation import InvestigationTraceResponse, ReasoningStep
from app.services.agent_service import run_investigation_agent

router = APIRouter()

@router.post("/{vuln_id}/investigate", response_model=InvestigationTraceResponse)
async def investigate_vulnerability(vuln_id: int, db: AsyncSession = Depends(get_db)):
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
    composite = vuln.risk_score.composite_score if vuln.risk_score else 50.0

    raw_steps = await run_investigation_agent(
        cve_id=vuln.cve_id,
        title=vuln.title,
        asset=vuln.affected_asset,
        cvss=cvss,
        epss=epss,
        kev=kev,
        composite=composite
    )

    # Persist steps in ReasoningTrace table
    for s in raw_steps:
        trace = ReasoningTrace(
            vulnerability_id=vuln.id,
            step_number=s["step_number"],
            step_reasoning=f"[{s['category']}] {s['title']}: {s['reasoning']}"
        )
        db.add(trace)
    
    await db.commit()

    # Audit action
    audit = AuditLog(action="RUN_INVESTIGATION_AGENT", target_type="vulnerability", target_id=str(vuln_id))
    db.add(audit)
    await db.commit()

    formatted_steps = [
        ReasoningStep(
            step_number=s["step_number"],
            title=s["title"],
            reasoning=s["reasoning"],
            category=s["category"]
        ) for s in raw_steps
    ]

    return InvestigationTraceResponse(
        vulnerability_id=vuln.id,
        cve_id=vuln.cve_id,
        composite_score=composite,
        steps=formatted_steps
    )
