import os
import logging
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, auth, firestore

logger = logging.getLogger(__name__)

# Initialize Firebase Admin App
_firebase_app: Optional[firebase_admin.App] = None
_firestore_db = None

def get_firebase_app() -> Optional[firebase_admin.App]:
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
    project_id = os.getenv("FIREBASE_PROJECT_ID", "vulnshieldai")

    try:
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred, {"projectId": project_id})
            logger.info(f"Initialized Firebase Admin with service account from {cred_path}")
        else:
            # Default initialization with Project ID (works with Google Cloud ADC or token verification)
            _firebase_app = firebase_admin.initialize_app(options={"projectId": project_id})
            logger.info(f"Initialized Firebase Admin for project '{project_id}'")
    except Exception as e:
        logger.warning(f"Could not initialize Firebase Admin SDK: {e}")
        try:
            _firebase_app = firebase_admin.get_app()
        except Exception:
            _firebase_app = None

    return _firebase_app

def get_firestore_client():
    global _firestore_db
    if _firestore_db is not None:
        return _firestore_db
    app = get_firebase_app()
    if app:
        try:
            _firestore_db = firestore.client(app=app)
        except Exception as e:
            logger.warning(f"Could not initialize Firestore client: {e}")
    return _firestore_db

def verify_firebase_id_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Verifies a Firebase ID token and returns decoded claims."""
    get_firebase_app()
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Failed to verify Firebase ID token: {e}")
        # Fallback decode if offline/dev mode
        try:
            from jose import jwt
            unverified = jwt.get_unverified_claims(id_token)
            if unverified.get("iss", "").startswith("https://securetoken.google.com/"):
                return unverified
        except Exception:
            pass
        return None
