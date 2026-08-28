from sqlalchemy import Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.vulnerability import Vulnerability

class ReasoningTrace(Base):
    __tablename__ = "reasoning_traces"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vulnerability_id: Mapped[int] = mapped_column(Integer, ForeignKey("vulnerabilities.id"), nullable=False)
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    step_reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    vulnerability: Mapped["Vulnerability"] = relationship("Vulnerability", back_populates="reasoning_traces")
