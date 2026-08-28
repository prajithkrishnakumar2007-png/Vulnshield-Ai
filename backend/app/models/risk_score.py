from sqlalchemy import Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.vulnerability import Vulnerability

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vulnerability_id: Mapped[int] = mapped_column(Integer, ForeignKey("vulnerabilities.id"), nullable=False, unique=True)
    cvss_score: Mapped[float] = mapped_column(Float, default=0.0)
    epss_score: Mapped[float] = mapped_column(Float, default=0.0)
    kev_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    composite_score: Mapped[float] = mapped_column(Float, default=0.0)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    vulnerability: Mapped["Vulnerability"] = relationship("Vulnerability", back_populates="risk_score")
