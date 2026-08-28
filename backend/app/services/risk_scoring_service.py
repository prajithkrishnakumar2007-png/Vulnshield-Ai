from app.core.config import settings

def calculate_composite_risk_score(cvss_score: float, epss_score: float, kev_flag: bool) -> float:
    """
    composite_score = (0.4 * normalized_cvss) + (0.4 * epss_score * 100) + (0.2 * (100 if kev_flag else 0))
    Normalized CVSS (0-10) scaled to 0-100 is cvss_score * 10.
    EPSS score (0.0 - 1.0) scaled to 0-100 is epss_score * 100.
    KEV flag is 100 if True else 0.
    """
    normalized_cvss = max(0.0, min(10.0, float(cvss_score or 0.0))) * 10.0
    epss_pct = max(0.0, min(1.0, float(epss_score or 0.0))) * 100.0
    kev_val = 100.0 if kev_flag else 0.0

    raw_score = (
        (settings.WEIGHT_CVSS * normalized_cvss) +
        (settings.WEIGHT_EPSS * epss_pct) +
        (settings.WEIGHT_KEV * kev_val)
    )

    # Clamp between 0.0 and 100.0
    return round(max(0.0, min(100.0, raw_score)), 1)
