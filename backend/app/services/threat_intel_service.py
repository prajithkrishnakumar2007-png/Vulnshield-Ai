import httpx
from typing import Dict, Any

# Known KEV list for fallback testing
KNOWN_KEVS = {
    "CVE-2021-44228", # Log4Shell
    "CVE-2023-34362", # MOVEit
    "CVE-2023-23397", # Outlook NTLM
    "CVE-2024-21626", # runc Container Escape
    "CVE-2024-30078", # Windows Wi-Fi Driver RCE
    "CVE-2023-4863",  # WebP Heap Buffer Overflow
    "CVE-2024-1709"   # ScreenConnect Authentication Bypass
}

async def fetch_threat_intel(cve_id: str) -> Dict[str, Any]:
    """Fetch EPSS and KEV status from public feeds or deterministic fallback."""
    intel = {
        "cve_id": cve_id,
        "epss_score": 0.05,
        "kev_flag": cve_id.upper() in KNOWN_KEVS,
        "source": "mock_intel"
    }

    # Attempt live FIRST EPSS lookup if network permits
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"https://api.first.org/data/v1/epss?cve={cve_id}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("data") and len(data["data"]) > 0:
                    epss_val = float(data["data"][0].get("epss", 0.05))
                    intel["epss_score"] = epss_val
                    intel["source"] = "first_epss_api"
    except Exception:
        pass # fallback

    return intel
