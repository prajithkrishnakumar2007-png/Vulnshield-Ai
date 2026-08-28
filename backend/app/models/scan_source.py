from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime, timezone
from app.core.database import Base

class ScanSource(Base):
    __tablename__ = "scan_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)  # e.g. Snyk, Nessus, Mock
    type: Mapped[str] = mapped_column(String, nullable=False)  # SAST, DAST, Infrastructure
    last_synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
