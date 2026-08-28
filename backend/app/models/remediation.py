from sqlalchemy import Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime, timezone
from typing import Optional, Any, TYPE_CHECKING
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.vulnerability import Vulnerability

class Remediation(Base):
    __tablename__ = "remediations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vulnerability_id: Mapped[int] = mapped_column(Integer, ForeignKey("vulnerabilities.id"), nullable=False)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=False)
    ai_fix_steps: Mapped[Any] = mapped_column(JSON, nullable=False)  # JSON array of step strings or dicts
    ai_generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    applied_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    vulnerability: Mapped["Vulnerability"] = relationship("Vulnerability", back_populates="remediations")
