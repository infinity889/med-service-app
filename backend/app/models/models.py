import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Numeric, Integer, ForeignKey, DateTime, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

# System / Processing Models

class SourceFile(Base):
    __tablename__ = 'source_files'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, xlsx
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String(50), default="UPLOADED") # UPLOADED, PARSING, MATCHING, COMPLETED, ERROR

    jobs = relationship("ProcessingJob", back_populates="source_file", cascade="all, delete-orphan")
    raw_records = relationship("RawRecord", back_populates="source_file", cascade="all, delete-orphan")


class ProcessingJob(Base):
    __tablename__ = 'processing_jobs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_file_id = Column(UUID(as_uuid=True), ForeignKey('source_files.id', ondelete="CASCADE"))
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="RUNNING")
    processed_records = Column(Integer, default=0)
    created_records = Column(Integer, default=0)
    updated_records = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)
    
    source_file = relationship("SourceFile", back_populates="jobs")


class RawRecord(Base):
    __tablename__ = 'raw_records'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_file_id = Column(UUID(as_uuid=True), ForeignKey('source_files.id', ondelete="CASCADE"))
    raw_service_name = Column(String(500), nullable=False)
    raw_price = Column(String(100), nullable=False)
    cleaned_service_name = Column(String(500), nullable=True)
    cleaned_price = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, VALIDATED, MATCHED, NEEDS_REVIEW, ERROR
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    source_file = relationship("SourceFile", back_populates="raw_records")
    needs_review = relationship("NeedsReview", back_populates="raw_record", cascade="all, delete-orphan")


class NeedsReview(Base):
    __tablename__ = 'needs_review'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_record_id = Column(UUID(as_uuid=True), ForeignKey('raw_records.id', ondelete="CASCADE"), nullable=False)
    suggested_service_id = Column(UUID(as_uuid=True), ForeignKey('services.id', ondelete="SET NULL"), nullable=True)
    similarity_score = Column(Numeric(5, 2), nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, RESOLVED
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    raw_record = relationship("RawRecord", back_populates="needs_review")
    suggested_service = relationship("Service")


# Domain Models

class Clinic(Base):
    __tablename__ = 'clinics'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(100))
    website = Column(String(255))
    logo_url = Column(String(255))
    working_hours = Column(String(255), nullable=True)
    rating = Column(Numeric(3, 2), nullable=True)
    has_online_booking = Column(Boolean, default=False, nullable=False)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    prices = relationship("Price", back_populates="clinic", cascade="all, delete-orphan")

    __table_args__ = (Index('idx_clinics_name', 'name'), Index('idx_clinics_city', 'city'))


class Category(Base):
    __tablename__ = 'categories'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    services = relationship("Service", back_populates="category")


class Service(Base):
    __tablename__ = 'services'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_name = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id', ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="services")
    aliases = relationship("ServiceAlias", back_populates="service", cascade="all, delete-orphan")
    prices = relationship("Price", back_populates="service")

    __table_args__ = (Index('idx_services_canonical_name', 'canonical_name'), Index('idx_services_category_id', 'category_id'))


class ServiceAlias(Base):
    __tablename__ = 'service_aliases'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey('services.id', ondelete="CASCADE"), nullable=False)
    alias_name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    service = relationship("Service", back_populates="aliases")

    __table_args__ = (Index('idx_service_aliases_name', 'alias_name'),)


class Price(Base):
    __tablename__ = 'prices'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey('clinics.id', ondelete="CASCADE"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey('services.id', ondelete="RESTRICT"), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), nullable=False, default='KZT')
    duration_days = Column(Integer, nullable=True)
    source_url = Column(Text, nullable=True) # changed to nullable=True as not all will come from URLs
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    clinic = relationship("Clinic", back_populates="prices")
    service = relationship("Service", back_populates="prices")
    history = relationship("PriceHistory", back_populates="price", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('price >= 0.00', name='chk_positive_price'),
        Index('idx_prices_live_lookup', 'price', 'last_updated'),
        Index('idx_prices_clinic_service', 'clinic_id', 'service_id')
    )


class PriceHistory(Base):
    __tablename__ = 'price_history'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    price_id = Column(UUID(as_uuid=True), ForeignKey('prices.id', ondelete="CASCADE"), nullable=False)
    old_price = Column(Numeric(12, 2), nullable=False)
    new_price = Column(Numeric(12, 2), nullable=False)
    changed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    price = relationship("Price", back_populates="history")

    __table_args__ = (Index('idx_price_history_lookup', 'price_id', 'changed_at'),)

