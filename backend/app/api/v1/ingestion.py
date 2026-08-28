import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.core.database import get_db
from app.models.scan_source import ScanSource
from app.models.vulnerability import Vulnerability
from app.models.risk_score import RiskScore
from app.models.audit_log import AuditLog
from app.services.normalization_service import compute_dedup_hash, normalize_snyk_item, normalize_nessus_item
from app.services.risk_scoring_service import calculate_composite_risk_score

router = APIRouter()

@router.post("/upload")
async def upload_scanner_data(
    file: UploadFile = File(...),
    scanner_type: str = Form("snyk"), # snyk or nessus or generic
    db: AsyncSession = Depends(get_db)
):
    try:
        content = await file.read()
        raw_json = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")
    
    # Get or create scan source
    source_name = f"{scanner_type.upper()} Import"
    result = await db.execute(select(ScanSource).where(ScanSource.name == source_name))
    source = result.scalars().first()
    if not source:
        source = ScanSource(name=source_name, type="STATIC_UPLOAD")
        db.add(source)
        await db.commit()
        await db.refresh(source)

    # Normalize items
    items = raw_json if isinstance(raw_json, list) else raw_json.get("vulnerabilities") or raw_json.get("findings") or [raw_json]
    imported_count = 0
    merged_count = 0

    for item in items:
        if scanner_type.lower() == "nessus":
            norm = normalize_nessus_item(item)
        else:
            norm = normalize_snyk_item(item)

        dedup = compute_dedup_hash(norm["cve_id"], norm["affected_asset"])

        # Check existing
        existing_res = await db.execute(select(Vulnerability).where(Vulnerability.dedup_hash == dedup))
        existing_vuln = existing_res.scalars().first()

        if existing_vuln:
            merged_count += 1
            existing_vuln.last_seen_at = norm.get("last_seen_at") or existing_vuln.last_seen_at
        else:
            vuln = Vulnerability(
                cve_id=norm["cve_id"],
                title=norm["title"],
                description=norm["description"],
                affected_asset=norm["affected_asset"],
                source_id=source.id,
                raw_severity=norm["raw_severity"],
                status="open",
                dedup_hash=dedup
            )
            db.add(vuln)
            await db.flush()

            # Calculate composite risk score
            comp_score = calculate_composite_risk_score(
                cvss_score=norm["cvss_score"],
                epss_score=norm["epss_score"],
                kev_flag=norm["kev_flag"]
            )
            risk = RiskScore(
                vulnerability_id=vuln.id,
                cvss_score=norm["cvss_score"],
                epss_score=norm["epss_score"],
                kev_flag=norm["kev_flag"],
                composite_score=comp_score
            )
            db.add(risk)
            imported_count += 1

    await db.commit()

    # Log audit action
    audit = AuditLog(action="INGEST_SCAN_FILE", target_type="scan_source", target_id=str(source.id))
    db.add(audit)
    await db.commit()

    return {
        "status": "success",
        "scanner_type": scanner_type,
        "imported_count": imported_count,
        "merged_count": merged_count,
        "message": f"Successfully processed {imported_count} new findings ({merged_count} merged deduplications)."
    }
