from fastapi import APIRouter
from app.services.threat_intel_service import fetch_threat_intel

router = APIRouter()

@router.get("/{cve_id}")
async def get_threat_intel(cve_id: str):
    intel = await fetch_threat_intel(cve_id)
    return intel
