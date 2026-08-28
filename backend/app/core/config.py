from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VulnShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "vulnshield_super_secret_jwt_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (PostgreSQL primary, SQLite fallback for dev)
    DATABASE_URL: str = "sqlite+aiosqlite:///./vulnshield.db"
    
    # AI Integration
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Risk Weightings (Composite Score Formula)
    WEIGHT_CVSS: float = 0.4
    WEIGHT_EPSS: float = 0.4
    WEIGHT_KEV: float = 0.2

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
