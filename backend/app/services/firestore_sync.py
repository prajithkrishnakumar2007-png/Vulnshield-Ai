import logging
from typing import Dict, Any, List
from app.core.firebase import get_firestore_client

logger = logging.getLogger(__name__)

def sync_vulnerability_to_firestore(vuln_data: Dict[str, Any]) -> bool:
    """Syncs a single vulnerability document to Firestore."""
    db = get_firestore_client()
    if not db:
        logger.warning("Firestore client not available. Skipping sync.")
        return False

    try:
        doc_id = str(vuln_data.get("id") or vuln_data.get("cve_id"))
        doc_ref = db.collection("vulnerabilities").document(doc_id)
        doc_ref.set(vuln_data, merge=True)
        logger.info(f"Successfully synced vulnerability {doc_id} to Firestore")
        return True
    except Exception as e:
        logger.error(f"Error syncing vulnerability to Firestore: {e}")
        return False

def sync_all_to_firestore(vulnerabilities: List[Dict[str, Any]]) -> int:
    """Batch syncs vulnerabilities to Firestore."""
    db = get_firestore_client()
    if not db:
        logger.warning("Firestore client not available.")
        return 0

    count = 0
    batch = db.batch()
    for v in vulnerabilities:
        doc_id = str(v.get("id") or v.get("cve_id"))
        doc_ref = db.collection("vulnerabilities").document(doc_id)
        batch.set(doc_ref, v, merge=True)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()

    if count % 400 != 0:
        batch.commit()

    logger.info(f"Successfully synced {count} vulnerabilities to Firestore.")
    return count
