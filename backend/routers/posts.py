from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Post, Department, Media, AiAnalysis, Incident, AuditLog, Comment, Alert
from backend.schemas import PostCreate, PostResponse, CommentCreate, CommentResponse
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

from difflib import SequenceMatcher
import os
from backend.services.external_dispatch import send_twilio_sms

def dispatch_crowdsourced_emergency_broadcast(post: Post, db: Session):
    # Compose emergency warning text
    warning_message = (
        f"🚨 [CROWDSOURCED EMERGENCY WARNING] Multiple independent citizens have reported: "
        f"\"{post.title}\" at {post.location}. Official validation is in progress. Please take necessary precautions immediately!"
    )
    
    # Query sender (default to admin coordinator)
    sender = db.query(User).filter(User.role == "ADMIN").first()
    sender_id = sender.id if sender else 1
    
    # Add Alert entry
    alert = Alert(
        sender_id=sender_id,
        alert_type="Emergency",
        severity="CRITICAL",
        location=post.location,
        radius_km=2.0,
        message=warning_message,
        channels="in-app,sms",
        delivered=0,
        pending=0,
        failed=0
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Broadcast alert via WebSocket
    import asyncio
    try:
        asyncio.create_task(manager.broadcast({
            "type": "NEW_ALERT",
            "alert": {
                "id": alert.id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "location": alert.location,
                "message": alert.message,
                "created_at": alert.created_at.isoformat()
            }
        }))
    except:
        pass

    # Send SMS using Twilio to all recipients
    recipient_phone_env = os.getenv("TEST_RECIPIENT_PHONE", "")
    recipient_phones = [p.strip() for p in recipient_phone_env.split(",") if p.strip()]
    
    db_users = db.query(User).filter(User.phone.isnot(None)).all()
    registered_phones = list(set([u.phone for u in db_users if u.phone]))
    
    sms_recipients = list(registered_phones)
    for phone in recipient_phones:
        if phone not in sms_recipients:
            sms_recipients.append(phone)
            
    print(f"\n[AUTO-DISPATCH CROWDSOURCED EMERGENCY WARNING]")
    print(f"TO: {len(sms_recipients)} recipient(s) due to duplicate count threshold >= 3")
    print(f"MESSAGE: {warning_message}")
    
    for phone in sms_recipients:
        try:
            send_twilio_sms(warning_message, phone)
        except Exception as ex:
            print(f"Failed sending Twilio SMS to {phone}: {ex}")

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
        creator = db.query(User).first()
        if not creator:
            raise HTTPException(status_code=400, detail="No users found in database.")
        user_id = creator.id

    # Compute similarity against active claims to find duplicates
    active_claims = db.query(Post).filter(
        Post.status.in_(["UNDER_REVIEW", "LIKELY_TRUE", "PARTIALLY_CORRECT", "SIMILAR_TO_EVENT", "VERIFIED", "CRITICAL"])
    ).all()
    
    matched_post = None
    for claim in active_claims:
        content_sim = SequenceMatcher(None, post_in.content.lower(), claim.content.lower()).ratio()
        title_sim = SequenceMatcher(None, post_in.title.lower(), claim.title.lower()).ratio()
        loc_match = (post_in.location.lower().strip() == claim.location.lower().strip()) if post_in.location and claim.location else True
        
        if (content_sim > 0.45 or title_sim > 0.45) and loc_match:
            matched_post = claim
            break

    initial_status = "UNDER_REVIEW"
    is_official = post_in.is_official_news or False
    
    if is_official:
        initial_status = "VERIFIED" # Official channels generate pre-verified events
        
    # Create the base post
    post = Post(
        user_id=user_id,
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
        location=post_in.location or "Unknown Location",
        latitude=post_in.latitude or 13.0827,
        longitude=post_in.longitude or 80.2707,
        status=initial_status,
        likes_count=0,
        is_official_news=is_official,
        news_source=post_in.news_source,
        duplicate_count=1
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
        
        from backend.database import SessionLocal
        background_tasks.add_task(simulate_image_analysis, post.id, SessionLocal)

    # Create Incident Tracker
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

    # Route and confidence rating logic based on source & similarity checks
    ai_confidence = 75
    ai_urgency = "LOW"
    ai_class = "UNDER_REVIEW"
    ai_summary = "No summary provided."
    ai_topic = post.category
    ai_reason = "Evaluated by Sentinel Media engine."
    
    media_dept = db.query(Department).filter(Department.code == "MEDIA").first()
    media_dept_id = media_dept.id if media_dept else None

    if is_official:
        # High confidence score for official news
        ai_confidence = 96
        ai_urgency = "HIGH"
        ai_class = "VERIFIED"
        ai_summary = f"Official media report published by verified source: {post.news_source}."
        
        # Route to Media Verification Bureau
        post.department_id = media_dept_id
        incident.status = "ROUTED"
        incident.severity = "HIGH"
        
        # Scan and align existing unverified claims matching this verified news event
        unverified_matches = db.query(Post).filter(
            Post.id != post.id,
            Post.is_official_news == False,
            Post.status.in_(["UNDER_REVIEW", "LIKELY_TRUE", "PARTIALLY_CORRECT"])
        ).all()
        
        for c in unverified_matches:
            content_sim = SequenceMatcher(None, post.content.lower(), c.content.lower()).ratio()
            if content_sim > 0.45:
                # Aligns with event -> update status to SIMILAR_TO_EVENT and route to MEDIA
                c.status = "SIMILAR_TO_EVENT"
                c.department_id = media_dept_id
                if c.ai_analysis:
                    c.ai_analysis.classification = "SIMILAR_TO_EVENT"
                    c.ai_analysis.recommended_department_id = media_dept_id
                db.commit()
    else:
        # Standard civilian report
        if matched_post:
            if matched_post.is_official_news:
                # Citizens posting about verified news events get categorized as similar
                post.status = "SIMILAR_TO_EVENT"
                post.department_id = media_dept_id
                ai_class = "SIMILAR_TO_EVENT"
                ai_confidence = matched_post.ai_analysis.confidence if matched_post.ai_analysis else 90
                ai_urgency = matched_post.ai_analysis.urgency if matched_post.ai_analysis else "MEDIUM"
                ai_summary = f"Civilian claim matching official news report: {matched_post.title}."
                incident.status = "ROUTED"
                incident.severity = ai_urgency
            else:
                # Citizens reporting unverified event -> increment duplicate counter
                matched_post.duplicate_count += 1
                
                # Check for Priority Escalation Threshold
                if matched_post.duplicate_count >= 3 and matched_post.status != "CRITICAL":
                    matched_post.status = "CRITICAL"
                    if matched_post.incident:
                        matched_post.incident.severity = "CRITICAL"
                        matched_post.incident.status = "ROUTED"
                    db.commit()
                    
                    # Auto-dispatch warnings and alert to bypass confirmation delay!
                    dispatch_crowdsourced_emergency_broadcast(matched_post, db)
                
                # Tag this claim as Similar to matched event
                post.status = "SIMILAR_TO_EVENT"
                post.department_id = matched_post.department_id
                ai_class = "SIMILAR_TO_EVENT"
                ai_confidence = 80
                ai_urgency = "MEDIUM"
                ai_summary = f"Citizen report matching active duplicate claim: {matched_post.title}."
                incident.status = "ROUTED"
                incident.severity = ai_urgency
        else:
            # Fully new civilian claim -> Run standard AI analysis
            ai_result = analyze_message(post.content)
            dept_name = ai_result.get("recommended_department", "Other Departments")
            department = db.query(Department).filter(Department.name == dept_name).first()
            if not department:
                department = db.query(Department).filter(Department.code == "OTHER").first()
                
            post.department_id = department.id if department else None
            ai_class = ai_result.get("classification", "UNDER_REVIEW")
            ai_urgency = ai_result.get("urgency", "LOW")
            ai_confidence = ai_result.get("confidence", 75)
            ai_summary = ai_result.get("summary", "No summary provided.")
            ai_topic = ai_result.get("topic", "General")
            ai_reason = ai_result.get("reason", "No reason provided.")
            
            if ai_urgency == "CRITICAL":
                incident.severity = "CRITICAL"
            else:
                incident.severity = ai_urgency
            incident.status = "ROUTED"
            
    db.commit()

    # Save AI Analysis entry
    ai_analysis = AiAnalysis(
        post_id=post.id,
        summary=ai_summary,
        topic=ai_topic,
        classification=ai_class,
        confidence=ai_confidence,
        urgency=ai_urgency,
        recommended_department_id=post.department_id,
        location=post.location,
        reason=ai_reason
    )
    db.add(ai_analysis)
    
    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action="AUTO_ROUTED_BY_AI",
        details=f"Post ID {post.id} processed. Official: {is_official}. Urgency: {ai_urgency}. Similarity checked."
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

@router.post("/{post_id}/like", response_model=PostResponse)
async def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.likes_count += 1
    db.commit()
    db.refresh(post)
    
    await manager.broadcast({
        "type": "POST_LIKED",
        "post_id": post_id,
        "likes_count": post.likes_count
    })
    
    return post

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post.comments

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    user_id = 1
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            pass
            
    user = db.query(User).filter(User.id == user_id).first()
    username = user.username if user else "civilian"
    
    comment = Comment(
        post_id=post_id,
        username=username,
        content=comment_in.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    await manager.broadcast({
        "type": "NEW_COMMENT",
        "post_id": post_id,
        "comment": {
            "id": comment.id,
            "post_id": comment.post_id,
            "username": comment.username,
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
        }
    })
    
    return comment
