import asyncio
import json
import os
import sys

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.scan_source import ScanSource
from app.models.vulnerability import Vulnerability
from app.models.risk_score import RiskScore
from app.models.remediation import Remediation
from app.models.reasoning_trace import ReasoningTrace
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.services.normalization_service import compute_dedup_hash, normalize_snyk_item, normalize_nessus_item
from app.services.risk_scoring_service import calculate_composite_risk_score
from app.services.ai_service import generate_ai_remediation
from app.services.agent_service import run_investigation_agent

async def seed_database():
    print("[INIT] Initializing VulnShield AI database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Users
        user_res = await db.execute(select(User))
        if not user_res.scalars().first():
            print("[USERS] Seeding default users...")
            admin = User(
                email="admin@vulnshield.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="Security Administrator",
                role="admin"
            )
            analyst = User(
                email="analyst@vulnshield.ai",
                hashed_password=get_password_hash("analyst123"),
                full_name="Lead Triage Analyst",
                role="analyst"
            )
            db.add_all([admin, analyst])
            await db.commit()

        # 2. Seed Scan Sources
        source_res = await db.execute(select(ScanSource))
        snyk_source = None
        nessus_source = None
        if not source_res.scalars().first():
            print("[SOURCES] Seeding scan sources...")
            snyk_source = ScanSource(name="Snyk Security Scan", type="SAST_DEPENDENCY")
            nessus_source = ScanSource(name="Tenable Nessus Scanner", type="INFRASTRUCTURE_DAST")
            db.add_all([snyk_source, nessus_source])
            await db.commit()
            await db.refresh(snyk_source)
            await db.refresh(nessus_source)
        else:
            snyk_source = (await db.execute(select(ScanSource).where(ScanSource.name.ilike("%snyk%")))).scalars().first()
            nessus_source = (await db.execute(select(ScanSource).where(ScanSource.name.ilike("%nessus%")))).scalars().first()

        # 3. Seed Vulnerabilities & Risk Scores from mock files
        vuln_res = await db.execute(select(Vulnerability))
        if not vuln_res.scalars().first():
            print("[VULNS] Ingesting sample vulnerabilities...")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Snyk
            snyk_path = os.path.join(base_dir, "snyk_sample.json")
            if os.path.exists(snyk_path):
                with open(snyk_path, "r", encoding="utf-8") as f:
                    snyk_data = json.load(f)
                    for item in snyk_data:
                        norm = normalize_snyk_item(item)
                        dedup = compute_dedup_hash(norm["cve_id"], norm["affected_asset"])
                        vuln = Vulnerability(
                            cve_id=norm["cve_id"],
                            title=norm["title"],
                            description=norm["description"],
                            affected_asset=norm["affected_asset"],
                            source_id=snyk_source.id if snyk_source else 1,
                            raw_severity=norm["raw_severity"],
                            status="open",
                            dedup_hash=dedup
                        )
                        db.add(vuln)
                        await db.flush()

                        comp_score = calculate_composite_risk_score(norm["cvss_score"], norm["epss_score"], norm["kev_flag"])
                        risk = RiskScore(
                            vulnerability_id=vuln.id,
                            cvss_score=norm["cvss_score"],
                            epss_score=norm["epss_score"],
                            kev_flag=norm["kev_flag"],
                            composite_score=comp_score
                        )
                        db.add(risk)

            # Nessus
            nessus_path = os.path.join(base_dir, "nessus_sample.json")
            if os.path.exists(nessus_path):
                with open(nessus_path, "r", encoding="utf-8") as f:
                    nessus_data = json.load(f)
                    for item in nessus_data:
                        norm = normalize_nessus_item(item)
                        dedup = compute_dedup_hash(norm["cve_id"], norm["affected_asset"])
                        vuln = Vulnerability(
                            cve_id=norm["cve_id"],
                            title=norm["title"],
                            description=norm["description"],
                            affected_asset=norm["affected_asset"],
                            source_id=nessus_source.id if nessus_source else 2,
                            raw_severity=norm["raw_severity"],
                            status="open",
                            dedup_hash=dedup
                        )
                        db.add(vuln)
                        await db.flush()

                        comp_score = calculate_composite_risk_score(norm["cvss_score"], norm["epss_score"], norm["kev_flag"])
                        risk = RiskScore(
                            vulnerability_id=vuln.id,
                            cvss_score=norm["cvss_score"],
                            epss_score=norm["epss_score"],
                            kev_flag=norm["kev_flag"],
                            composite_score=comp_score
                        )
                        db.add(risk)

            await db.commit()

            # 4. Generate AI Remediation & Investigation Reasoning Trace for critical vulns
            print("[AI] Generating sample AI remediations & reasoning traces...")
            all_vulns_res = await db.execute(select(Vulnerability))
            all_vulns = all_vulns_res.scalars().all()

            for v in all_vulns[:3]: # top 3 vulnerabilities
                ai_data = await generate_ai_remediation(
                    cve_id=v.cve_id,
                    title=v.title,
                    description=v.description or "",
                    affected_asset=v.affected_asset,
                    cvss_score=9.8,
                    epss_score=0.95,
                    kev_flag=True
                )
                rem = Remediation(
                    vulnerability_id=v.id,
                    ai_summary=ai_data["ai_summary"],
                    ai_fix_steps=ai_data["ai_fix_steps"]
                )
                db.add(rem)

                trace_steps = await run_investigation_agent(
                    cve_id=v.cve_id,
                    title=v.title,
                    asset=v.affected_asset,
                    cvss=9.8,
                    epss=0.95,
                    kev=True,
                    composite=96.4
                )
                for s in trace_steps:
                    trace = ReasoningTrace(
                        vulnerability_id=v.id,
                        step_number=s["step_number"],
                        step_reasoning=f"[{s['category']}] {s['title']}: {s['reasoning']}"
                    )
                    db.add(trace)

            # 5. Seed Audit Logs
            print("[AUDIT] Logging initial system audit entries...")
            audit1 = AuditLog(action="SYSTEM_INIT", target_type="system", target_id="1")
            audit2 = AuditLog(action="MOCK_DATA_SEED", target_type="vulnerability", target_id="10")
            db.add_all([audit1, audit2])

            await db.commit()
            print("[SUCCESS] Database seeding complete! VulnShield AI is ready.")

if __name__ == "__main__":
    asyncio.run(seed_database())
