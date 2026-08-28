from fastapi import APIRouter
from app.api.v1 import auth, ingestion, vulnerabilities, risk_scoring, threat_intel, remediation, agent, reports, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(vulnerabilities.router, prefix="/vulnerabilities", tags=["vulnerabilities"])
api_router.include_router(risk_scoring.router, prefix="/risk-scoring", tags=["risk-scoring"])
api_router.include_router(threat_intel.router, prefix="/threat-intel", tags=["threat-intel"])
api_router.include_router(remediation.router, prefix="/remediation", tags=["remediation"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
