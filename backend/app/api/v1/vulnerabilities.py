from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.database import get_db
from app.models.vulnerability import Vulnerability
from app.models.risk_score import RiskScore
from app.models.audit_log import AuditLog
from app.schemas.vulnerability import VulnerabilityResponse, VulnerabilityListResponse, VulnerabilityUpdateStatus

router = APIRouter()

@router.get("/", response_model=VulnerabilityListResponse)
async def list_vulnerabilities(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    kev_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    query = select(Vulnerability).options(selectinload(Vulnerability.risk_score))

    if status:
        query = query.where(Vulnerability.status == status)
    if severity:
        query = query.where(Vulnerability.raw_severity == severity.upper())
    if search:
        term = f"%{search}%"
        query = query.where(
            (Vulnerability.cve_id.ilike(term)) |
            (Vulnerability.title.ilike(term)) |
            (Vulnerability.affected_asset.ilike(term))
        )

    result = await db.execute(query)
    vulns = result.scalars().all()

    if kev_only:
        vulns = [v for v in vulns if v.risk_score and v.risk_score.kev_flag]

    # Calculate summary metrics
    open_count = sum(1 for v in vulns if v.status == "open")
    critical_count = sum(1 for v in vulns if v.raw_severity == "CRITICAL")
    scores = [v.risk_score.composite_score for v in vulns if v.risk_score]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    return VulnerabilityListResponse(
        items=[VulnerabilityResponse.model_validate(v) for v in vulns],
        total=len(vulns),
        open_count=open_count,
        critical_count=critical_count,
        avg_risk_score=avg_score
    )

@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
async def get_vulnerability(vuln_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vulnerability)
        .options(selectinload(Vulnerability.risk_score))
        .where(Vulnerability.id == vuln_id)
    )
    vuln = result.scalars().first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return VulnerabilityResponse.model_validate(vuln)

@router.patch("/{vuln_id}/status", response_model=VulnerabilityResponse)
async def update_vulnerability_status(
    vuln_id: int,
    status_update: VulnerabilityUpdateStatus,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Vulnerability)
        .options(selectinload(Vulnerability.risk_score))
        .where(Vulnerability.id == vuln_id)
    )
    vuln = result.scalars().first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    old_status = vuln.status
    vuln.status = status_update.status
    await db.commit()
    await db.refresh(vuln)

    # Audit log action
    audit = AuditLog(
        action=f"STATUS_CHANGE_{old_status.upper()}_TO_{status_update.status.upper()}",
        target_type="vulnerability",
        target_id=str(vuln_id)
    )
    db.add(audit)
    await db.commit()

    return VulnerabilityResponse.model_validate(vuln)
