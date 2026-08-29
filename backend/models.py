from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="USER") # USER, ADMIN, STAFF
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="user")
    messages = relationship("Message", back_populates="user")
    verifications = relationship("Verification", back_populates="verifier")
    alerts_sent = relationship("Alert", back_populates="sender")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    department = relationship("Department", back_populates="staff")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False) # WATER, WEATHER, TRAFFIC, HEALTH, DISASTER, POLICE, ELECTRICITY, OTHER
    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("User", back_populates="department")
    posts = relationship("Post", back_populates="department")
    ai_recommendations = relationship("AiAnalysis", back_populates="recommended_department")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False) # Flood, Accident, Rain, Outage, Epidemic, Fire, Other
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="UNDER_REVIEW") # UNDER_REVIEW, LIKELY_TRUE, PARTIALLY_CORRECT, LIKELY_FALSE, VERIFIED, FALSE, CRITICAL
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="posts")
    department = relationship("Department", back_populates="posts")
    media = relationship("Media", back_populates="post", cascade="all, delete-orphan")
    ai_analysis = relationship("AiAnalysis", uselist=False, back_populates="post", cascade="all, delete-orphan")
    verification = relationship("Verification", uselist=False, back_populates="post", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="post", cascade="all, delete-orphan")
    incident = relationship("Incident", uselist=False, back_populates="post")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="messages")

class Media(Base):
    __tablename__ = "media"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    file_path = Column(String, nullable=False)
    metadata_size = Column(String, nullable=True)
    metadata_mime = Column(String, nullable=True)
    analysis_stage = Column(String, default="PENDING") # PENDING, METADATA_ANALYZED, VISUAL_ANALYZED, DUPLICATE_CHECKED, CLAIM_MATCHED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="media")

class AiAnalysis(Base):
    __tablename__ = "ai_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    topic = Column(String, nullable=True)
    classification = Column(String, nullable=True)
    confidence = Column(Integer, default=50)
    urgency = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    recommended_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    location = Column(String, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="ai_analysis")
    recommended_department = relationship("Department", back_populates="ai_recommendations")

class Verification(Base):
    __tablename__ = "verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    verifier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False) # VERIFIED, PARTIALLY_CORRECT, FALSE, UNDER_REVIEW
    official_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="verification")
    verifier = relationship("User", back_populates="verifications")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String, nullable=False) # Flood, Weather, Traffic, General, Emergency
    severity = Column(String, nullable=False) # MINOR, MODERATE, SEVERE, CRITICAL
    location = Column(String, nullable=False)
    radius_km = Column(Float, default=1.0)
    message = Column(Text, nullable=False)
    channels = Column(String, nullable=False) # comma separated values: in-app, push, sms, emergency-sos, whatsapp
    delivered = Column(Integer, default=0)
    pending = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", back_populates="alerts_sent")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="INFO") # ALERT, VERIFICATION, INFO
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    post = relationship("Post", back_populates="notifications")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, default="SUBMITTED") # SUBMITTED, AI_ANALYSIS, ROUTED, UNDER_REVIEW, OFFICIAL_RESPONSE
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="incident")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
