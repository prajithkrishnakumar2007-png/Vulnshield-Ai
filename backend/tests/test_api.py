import pytest
from app.services.risk_scoring_service import calculate_composite_risk_score
from app.services.normalization_service import compute_dedup_hash, normalize_snyk_item

def test_composite_risk_score():
    # Test high severity with KEV
    score = calculate_composite_risk_score(cvss_score=10.0, epss_score=0.975, kev_flag=True)
    assert score >= 95.0

    # Test low severity without KEV
    low_score = calculate_composite_risk_score(cvss_score=3.0, epss_score=0.01, kev_flag=False)
    assert low_score <= 20.0

def test_deduplication_hashing():
    hash1 = compute_dedup_hash("CVE-2021-44228", "org.apache.logging.log4j:log4j-core")
    hash2 = compute_dedup_hash("cve-2021-44228", "ORG.APACHE.LOGGING.LOG4J:LOG4J-CORE")
    assert hash1 == hash2

def test_snyk_normalization():
    raw = {
        "cve_id": "CVE-2021-44228",
        "title": "Log4Shell",
        "packageName": "log4j-core",
        "severity": "CRITICAL",
        "cvssScore": 10.0,
        "epss_score": 0.95,
        "kev_flag": True
    }
    norm = normalize_snyk_item(raw)
    assert norm["cve_id"] == "CVE-2021-44228"
    assert norm["raw_severity"] == "CRITICAL"
    assert norm["cvss_score"] == 10.0
    assert norm["kev_flag"] is True
