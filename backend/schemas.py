from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Department schemas
class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "USER"
    department_id: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    department_id: Optional[int] = None
    department: Optional[DepartmentResponse] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Media Schema
class MediaResponse(BaseModel):
    id: int
    file_path: str
    metadata_size: Optional[str] = None
    metadata_mime: Optional[str] = None
    analysis_stage: str
    created_at: datetime
    class Config:
        from_attributes = True

# AI Analysis schemas
class AiAnalysisResponse(BaseModel):
    id: int
    summary: Optional[str]
    topic: Optional[str]
    classification: Optional[str]
    confidence: int
    urgency: str
    recommended_department: Optional[DepartmentResponse] = None
    location: Optional[str]
    reason: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Verification schemas
class VerificationCreate(BaseModel):
    status: str
    official_response: Optional[str] = None

class VerificationResponse(BaseModel):
    id: int
    status: str
    official_response: Optional[str]
    created_at: datetime
    verifier: UserResponse
    class Config:
        from_attributes = True

# Post schemas
class PostCreate(BaseModel):
    title: str
    content: str
    category: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None # For demo client to attach image path

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    created_at: datetime
    user: UserResponse
    department: Optional[DepartmentResponse] = None
    media: List[MediaResponse] = []
    ai_analysis: Optional[AiAnalysisResponse] = None
    verification: Optional[VerificationResponse] = None
    class Config:
        from_attributes = True

# Message schemas
class MessageCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    created_at: datetime
    user: UserResponse
    class Config:
        from_attributes = True

# Alert schemas
class AlertCreate(BaseModel):
    alert_type: str
    severity: str
    location: str
    radius_km: float
    message: str
    channels: str # comma separated list

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    location: str
    radius_km: float
    message: str
    channels: str
    delivered: int
    pending: int
    failed: int
    created_at: datetime
    class Config:
        from_attributes = True

# Incident schemas
class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location: str
    severity: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Dashboard Stats schemas
class DashboardStats(BaseModel):
    total_posts: int
    under_review: int
    verified: int
    false_claims: int
    critical_incidents: int
