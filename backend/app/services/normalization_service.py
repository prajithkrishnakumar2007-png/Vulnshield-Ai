import hashlib
from typing import Dict, Any, Tuple

def compute_dedup_hash(cve_id: str, affected_asset: str) -> str:
    """Hash on (cve_id + affected_asset) to deduplicate raw scanner findings."""
    raw = f"{cve_id.strip().upper()}:{affected_asset.strip().lower()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def normalize_snyk_item(item: Dict[str, Any]) -> Dict[str, Any]:
    cve = item.get("cve_id") or item.get("id") or "CVE-UNKNOWN"
    asset = item.get("packageName") or item.get("target") or "Unknown-Asset"
    title = item.get("title") or item.get("name") or f"Vulnerability in {asset}"
    severity = (item.get("severity") or "MEDIUM").upper()
    cvss = float(item.get("cvssScore") or 0.0)
    
    return {
        "cve_id": cve,
        "title": title,
        "description": item.get("description") or f"Discovered by Snyk in package {asset}",
        "affected_asset": asset,
        "raw_severity": severity,
        "cvss_score": cvss,
        "epss_score": float(item.get("epss_score") or 0.05),
        "kev_flag": bool(item.get("kev_flag") or False)
    }

def normalize_nessus_item(item: Dict[str, Any]) -> Dict[str, Any]:
    cve = item.get("cve") or item.get("cve_id") or "CVE-UNKNOWN"
    asset = item.get("host") or item.get("ip") or "Unknown-Host"
    title = item.get("plugin_name") or item.get("title") or f"Finding on {asset}"
    severity_map = {"0": "INFO", "1": "LOW", "2": "MEDIUM", "3": "HIGH", "4": "CRITICAL"}
    raw_sev = str(item.get("severity", "2"))
    severity = severity_map.get(raw_sev, raw_sev.upper())
    cvss = float(item.get("cvss_base_score") or item.get("cvss") or 0.0)

    return {
        "cve_id": cve,
        "title": title,
        "description": item.get("synopsis") or item.get("description") or f"Nessus plugin scan on host {asset}",
        "affected_asset": asset,
        "raw_severity": severity,
        "cvss_score": cvss,
        "epss_score": float(item.get("epss") or 0.02),
        "kev_flag": bool(item.get("in_kev") or False)
    }
