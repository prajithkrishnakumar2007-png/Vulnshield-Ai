import asyncio
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.vulnerability import Vulnerability
from app.models.risk_score import RiskScore
from app.models.remediation import Remediation
from app.models.reasoning_trace import ReasoningTrace
from app.services.firestore_sync import sync_all_to_firestore
from app.core.firebase import get_firestore_client

async def run_sync():
    print("[FIRESTORE] Connecting to Firebase Firestore...")
    client = get_firestore_client()
    if not client:
        print("[ERROR] Failed to initialize Firestore client. Check credentials.")
        return

    async with AsyncSessionLocal() as db:
        vuln_res = await db.execute(select(Vulnerability))
        vulns = vuln_res.scalars().all()
        print(f"[SQL] Found {len(vulns)} vulnerabilities in local database.")

        records = []
        for v in vulns:
            risk_res = await db.execute(select(RiskScore).where(RiskScore.vulnerability_id == v.id))
            risk = risk_res.scalars().first()

            remed_res = await db.execute(select(Remediation).where(Remediation.vulnerability_id == v.id))
            remed = remed_res.scalars().first()

            trace_res = await db.execute(select(ReasoningTrace).where(ReasoningTrace.vulnerability_id == v.id))
            trace = trace_res.scalars().first()

            item = {
                "id": v.id,
                "cve_id": v.cve_id,
                "title": v.title,
                "description": v.description,
                "affected_asset": v.affected_asset,
                "raw_severity": v.raw_severity,
                "status": v.status,
                "first_seen_at": v.first_seen_at.isoformat() if v.first_seen_at else None,
                "last_seen_at": v.last_seen_at.isoformat() if v.last_seen_at else None,
                "risk": {
                    "cvss": risk.cvss_score if risk else 0.0,
                    "epss": risk.epss_score if risk else 0.0,
                    "kev_flag": risk.kev_flag if risk else False,
                    "composite_score": risk.composite_score if risk else 0.0
                } if risk else None,
                "remediation": {
                    "ai_summary": remed.ai_summary if remed else None,
                    "ai_fix_steps": remed.ai_fix_steps if remed else []
                } if remed else None,
                "reasoning_trace": {
                    "step_number": trace.step_number if trace else None,
                    "step_reasoning": trace.step_reasoning if trace else None
                } if trace else None
            }
            records.append(item)

        synced = sync_all_to_firestore(records)
        print(f"[SUCCESS] Successfully synced {synced} vulnerability documents to Firestore 'vulnerabilities' collection!")

if __name__ == "__main__":
    asyncio.run(run_sync())
