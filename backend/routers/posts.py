from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Post, Department, Media, AiAnalysis, Incident, AuditLog
from backend.schemas import PostCreate, PostResponse
from backend.services.ollama_service import analyze_message
from backend.services.websocket_manager import manager
import asyncio
from typing import List, Optional
import datetime

router = APIRouter(prefix="/api/posts", tags=["posts"])

async def simulate_image_analysis(post_id: int, db_session_factory):
    """
    Background worker simulating 5 stages of forensic image analysis:
    PENDING -> METADATA_ANALYZED -> VISUAL_ANALYZED -> DUPLICATE_CHECKED -> CLAIM_MATCHED -> COMPLETED
    """
    stages = [
        ("METADATA_ANALYZED", "Extracting EXIF data, device info, and timestamp...", 1000),
        ("VISUAL_ANALYZED", "Running object detection and scene reconstruction...", 1500),
        ("DUPLICATE_CHECKED", "Searching regional databases for duplicates or historical matches...", 1200),
        ("CLAIM_MATCHED", "Comparing visual context against known active claims...", 1000),
        ("COMPLETED", "Forensic analysis completed. Visual authenticity score: 94%. No duplicates.", 800)
    ]
    
    for stage, message, delay in stages:
        await asyncio.sleep(delay / 1000.0)
        db = db_session_factory()
        try:
            media_item = db.query(Media).filter(Media.post_id == post_id).first()
            if not media_item:
                break
            media_item.analysis_stage = stage
            db.commit()
            
            # Broadcast the image analysis stage update to all WebSocket clients
            await manager.broadcast({
                "type": "IMAGE_ANALYSIS_PROGRESS",
                "post_id": post_id,
                "stage": stage,
                "message": message
            })
        except Exception as e:
            print(f"Error in image analysis background task: {e}")
        finally:
            db.close()

@router.get("", response_model=List[PostResponse])
def get_posts(
    category: Optional[str] = None,
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    if category:
        query = query.filter(Post.category == category)
    if status:
        query = query.filter(Post.status == status)
    if department_id:
        query = query.filter(Post.department_id == department_id)
    
    return query.order_by(Post.created_at.desc()).all()

@router.post("", response_model=PostResponse)
async def create_post(
    post_in: PostCreate,
    background_tasks: BackgroundTasks,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Determine creator user. Default to User 1 (Demo User) if not provided.
    user_id = 1
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            pass
            
    creator = db.query(User).filter(User.id == user_id).first()
    if not creator:
        # Fallback to creating a general demo user if none exists
        creator = db.query(User).first()
        if not creator:
            raise HTTPException(status_code=400, detail="No users found in database.")
        user_id = creator.id

    # Create the base post
    post = Post(
        user_id=user_id,
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
        location=post_in.location or "Unknown Location",
        latitude=post_in.latitude or 13.0827, # default Chennai lat
        longitude=post_in.longitude or 80.2707, # default Chennai lon
        status="UNDER_REVIEW"
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Initialize associated media record if user uploaded a mock image path
    if post_in.image_url:
        media = Media(
            post_id=post.id,
            file_path=post_in.image_url,
            metadata_size="4.2 MB",
            metadata_mime="image/jpeg",
            analysis_stage="PENDING"
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        
        # Spawn image analyzer pipeline in background
        from backend.database import SessionLocal
        background_tasks.add_task(simulate_image_analysis, post.id, SessionLocal)

    # Create an initial Incident Tracker
    incident = Incident(
        title=post.title,
        description=post.content,
        category=post.category,
        location=post.location,
        severity="LOW",
        status="SUBMITTED",
        post_id=post.id
    )
    db.add(incident)
    db.commit()

    # Trigger automatic AI analysis
    ai_result = analyze_message(post.content)
    
    # Map AI recommended department to database departments
    dept_name = ai_result.get("recommended_department", "Other Departments")
    department = db.query(Department).filter(Department.name == dept_name).first()
    if not department:
        # Fallback to Other Departments
        department = db.query(Department).filter(Department.code == "OTHER").first()

    # Update Post department and initial AI classification
    post.department_id = department.id if department else None
    
    # If the AI classified this as an urgent alert or detected critical status
    ai_class = ai_result.get("classification", "UNDER_REVIEW")
    ai_urgency = ai_result.get("urgency", "LOW")
    
    if ai_urgency == "CRITICAL":
        post.status = "UNDER_REVIEW" # Government must verify first
        incident.severity = "CRITICAL"
    else:
        post.status = "UNDER_REVIEW"
        incident.severity = ai_urgency
        
    incident.status = "ROUTED"
    db.commit()

    # Create AI Analysis entry
    ai_analysis = AiAnalysis(
        post_id=post.id,
        summary=ai_result.get("summary", "No summary provided."),
        topic=ai_result.get("topic", "General"),
        classification=ai_class,
        confidence=ai_result.get("confidence", 75),
        urgency=ai_urgency,
        recommended_department_id=department.id if department else None,
        location=ai_result.get("location", "Unknown"),
        reason=ai_result.get("reason", "No reason provided.")
    )
    db.add(ai_analysis)
    
    # Log the action in Audit Log
    audit = AuditLog(
        user_id=user_id,
        action="AUTO_ROUTED_BY_AI",
        details=f"Post ID {post.id} routed to {dept_name}. AI Urgency: {ai_urgency}. Confidence: {ai_analysis.confidence}%"
    )
    db.add(audit)
    db.commit()
    db.refresh(post)

    # Broadcast new post creation via WebSockets
    await manager.broadcast({
        "type": "NEW_POST",
        "post": {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "location": post.location,
            "status": post.status,
            "created_at": post.created_at.isoformat(),
            "user": {
                "username": creator.username,
                "role": creator.role
            },
            "department": {
                "name": department.name if department else "Unassigned"
            },
            "ai_analysis": {
                "topic": ai_analysis.topic,
                "urgency": ai_analysis.urgency,
                "confidence": ai_analysis.confidence,
                "classification": ai_analysis.classification,
                "summary": ai_analysis.summary,
                "reason": ai_analysis.reason
            },
            "image_url": post_in.image_url
        }
    })

    return post

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{post_id}/route", response_model=PostResponse)
async def reroute_post(
    post_id: int,
    department_id: int,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = 1
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            pass

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    old_dept_name = post.department.name if post.department else "Unassigned"
    post.department_id = department_id
    
    # Update Incident timeline status
    if post.incident:
        post.incident.status = "ROUTED"

    # Add audit log entry
    audit = AuditLog(
        user_id=user_id,
        action="MANUAL_REROUTE",
        details=f"Post ID {post_id} rerouted from {old_dept_name} to {department.name}."
    )
    db.add(audit)
    db.commit()
    db.refresh(post)

    # Broadcast updates via WebSockets
    await manager.broadcast({
        "type": "POST_REROUTED",
        "post_id": post_id,
        "department_id": department_id,
        "department_name": department.name
    })

    return post
