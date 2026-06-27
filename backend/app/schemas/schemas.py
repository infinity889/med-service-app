from pydantic import BaseModel, UUID4, HttpUrl, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# Clinic Schemas
class ClinicBase(BaseModel):
    name: str
    slug: str
    city: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    working_hours: Optional[str] = None
    rating: Optional[float] = None
    has_online_booking: bool = False
    is_active: bool = True

class ClinicCreate(ClinicBase):
    pass

class ClinicResponse(ClinicBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ClinicPriceResponse(BaseModel):
    id: UUID4
    service_id: UUID4
    service_name: str
    price: float
    currency: str
    duration_days: Optional[int] = None
    is_available: bool

class ClinicDetailResponse(ClinicResponse):
    prices: List[ClinicPriceResponse] = []

# Category Schemas
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Service Schemas
class ServiceBase(BaseModel):
    canonical_name: str
    description: Optional[str] = None
    category_id: UUID4

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Price Schemas
class PriceBase(BaseModel):
    clinic_id: UUID4
    service_id: UUID4
    price: float = Field(..., ge=0)
    currency: str = "KZT"
    duration_days: Optional[int] = None
    source_url: Optional[str] = None
    is_available: bool = True

class PriceCreate(PriceBase):
    pass

class PriceResponse(PriceBase):
    id: UUID4
    model_config = ConfigDict(from_attributes=True)

# Job and Parsing Schemas
class SourceFileBase(BaseModel):
    filename: str
    file_path: str
    file_type: str

class SourceFileCreate(SourceFileBase):
    pass

class SourceFileResponse(SourceFileBase):
    id: UUID4
    uploaded_at: datetime
    status: str
    model_config = ConfigDict(from_attributes=True)

class ProcessingJobBase(BaseModel):
    source_file_id: UUID4
    status: str = "RUNNING"

class ProcessingJobCreate(ProcessingJobBase):
    pass

class ProcessingJobResponse(ProcessingJobBase):
    id: UUID4
    started_at: datetime
    finished_at: Optional[datetime]
    processed_records: int
    created_records: int
    updated_records: int
    errors_count: int
    model_config = ConfigDict(from_attributes=True)

class RawRecordBase(BaseModel):
    source_file_id: UUID4
    raw_service_name: str
    raw_price: str

class RawRecordCreate(RawRecordBase):
    pass

class RawRecordResponse(RawRecordBase):
    id: UUID4
    cleaned_service_name: Optional[str] = None
    cleaned_price: Optional[float] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

