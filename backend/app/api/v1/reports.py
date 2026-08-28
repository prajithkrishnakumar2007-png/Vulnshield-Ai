from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models.vulnerability import Vulnerability
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.schemas.report import ReportCreate, ReportResponse
from app.services.report_service import generate_mttr_report, generate_compliance_report

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    reports = result.scalars().all()
    return [ReportResponse.model_validate(r) for r in reports]

@router.post("/generate", response_model=ReportResponse)
async def create_report(req: ReportCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vulnerability).options(selectinload(Vulnerability.risk_score)))
    vulns = result.scalars().all()

    if req.type == "compliance":
        payload = generate_compliance_report(vulns)
    else:
        payload = generate_mttr_report(vulns)

    report = Report(
        title=req.title,
        type=req.type,
        generated_by=1, # Admin default
        payload_json=payload
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Audit log action
    audit = AuditLog(action="GENERATE_REPORT", target_type="report", target_id=str(report.id))
    db.add(audit)
    await db.commit()

    return ReportResponse.model_validate(report)
