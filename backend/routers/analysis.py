from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Post, Verification, User, AuditLog, Notification, Department, Incident
from backend.schemas import PostResponse, VerificationResponse
from backend.services.ollama_service import analyze_message
from backend.services.websocket_manager import manager
from typing import List, Optional
import datetime

router = APIRouter(prefix="/api", tags=["analysis"])

class AnalyzeRequest(BaseModel):
    text: str

class VerificationSubmit(BaseModel):
    post_id: int
    status: str # VERIFIED, PARTIALLY_CORRECT, FALSE, UNDER_REVIEW, CRITICAL
    official_response: str

class ReportSubmit(BaseModel):
    title: str
    description: str
    category: str
    location: str
    severity: str
    image_url: Optional[str] = None

@router.post("/analyze")
def trigger_analysis(request: AnalyzeRequest):
    """
    Manually analyze a block of text using Ollama AI analysis service.
    """
    return analyze_message(request.text)

@router.post("/verification", response_model=PostResponse)
async def submit_verification(
    verification_in: VerificationSubmit,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Submits a government department verification on a user-submitted claim.
    Updates the post status, publishes an official response, and broadcasts to users.
    """
    # Authenticate verifier
    user_id = 2 # default verifier
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            pass

    verifier = db.query(User).filter(User.id == user_id).first()
    if not verifier or verifier.role not in ["ADMIN", "STAFF"]:
        # Fallback to demo admin if lookup fails
        verifier = db.query(User).filter(User.role == "ADMIN").first()
        if not verifier:
            raise HTTPException(status_code=403, detail="Unauthorized role for verification.")

    post = db.query(Post).filter(Post.id == verification_in.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Create or update verification record
    verification = db.query(Verification).filter(Verification.post_id == post.id).first()
    if not verification:
        verification = Verification(
            post_id=post.id,
            verifier_id=verifier.id,
            status=verification_in.status,
            official_response=verification_in.official_response
        )
        db.add(verification)
    else:
        verification.status = verification_in.status
        verification.official_response = verification_in.official_response
        verification.verifier_id = verifier.id
        verification.created_at = datetime.datetime.utcnow()

    # Update Post status
    post.status = verification_in.status
    
    # Update Incident Tracker
    if post.incident:
        post.incident.status = "OFFICIAL_RESPONSE"
        if verification_in.status == "CRITICAL":
            post.incident.severity = "CRITICAL"

    # Create Notification for the author of the post
    author = db.query(User).filter(User.id == post.user_id).first()
    if author:
        notification = Notification(
            user_id=author.id,
            title="Post Status Updated",
            message=f"Your post '{post.title}' has been reviewed by the {post.department.name if post.department else 'government'} and marked as {post.status}.",
            type="VERIFICATION",
            post_id=post.id
        )
        db.add(notification)

    # Log action
    audit = AuditLog(
        user_id=verifier.id,
        action="OFFICIAL_VERIFICATION",
        details=f"Post ID {post.id} verified as {post.status} by User ID {verifier.id}. Response: '{verification_in.official_response[:50]}...'"
    )
    db.add(audit)
    db.commit()
    db.refresh(post)

    # Broadcast updated post to all WebSocket connections
    await manager.broadcast({
        "type": "POST_VERIFIED",
        "post_id": post.id,
        "status": post.status,
        "official_response": verification_in.official_response,
        "department_name": post.department.name if post.department else "Government",
        "updated_at": verification.created_at.isoformat()
    })

    return post

@router.post("/reports", response_model=PostResponse)
async def submit_report(
    report_in: ReportSubmit,
    db: Session = Depends(get_db)
):
    """
    Submits a comprehensive incident report (creates a post & triggers AI workflow).
    """
    # Create the post
    user = db.query(User).first() # Default demo reporter
    post = Post(
        user_id=user.id if user else 1,
        title=report_in.title,
        content=report_in.description,
        category=report_in.category,
        location=report_in.location,
        latitude=13.0827,
        longitude=80.2707,
        status="UNDER_REVIEW"
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # AI Processing Heuristics/LLM call
    ai_result = analyze_message(post.content)
    dept_name = ai_result.get("recommended_department", "Other Departments")
    department = db.query(Department).filter(Department.name == dept_name).first()
    if not department:
        department = db.query(Department).filter(Department.code == "OTHER").first()

    post.department_id = department.id if department else None
    db.commit()

    # AI Analysis entry
    ai_analysis = AiAnalysis(
        post_id=post.id,
        summary=ai_result.get("summary", "No summary provided."),
        topic=ai_result.get("topic", "General"),
        classification=ai_result.get("classification", "UNDER_REVIEW"),
        confidence=ai_result.get("confidence", 75),
        urgency=ai_result.get("urgency", report_in.severity.upper()),
        recommended_department_id=department.id if department else None,
        location=ai_result.get("location", report_in.location),
        reason=ai_result.get("reason", "No reason provided.")
    )
    db.add(ai_analysis)

    # Create Incident
    incident = Incident(
        title=post.title,
        description=post.content,
        category=post.category,
        location=post.location,
        severity=report_in.severity.upper(),
        status="ROUTED",
        post_id=post.id
    )
    db.add(incident)
    db.commit()
    db.refresh(post)

    # Broadcast
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
                "username": user.username if user else "anonymous",
                "role": user.role if user else "USER"
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
            }
        }
    })

    return post

@router.get("/fact-check")
def search_fact_check(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search and retrieve public claims that have been verified, marked partially correct, or false.
    """
    # Return posts that are verified, partially correct, false, or critical
    query = db.query(Post).filter(Post.status.in_(["VERIFIED", "PARTIALLY_CORRECT", "FALSE", "CRITICAL"]))
    
    if q:
        query = query.filter(Post.title.contains(q) | Post.content.contains(q))
        
    posts = query.order_by(Post.created_at.desc()).all()
    
    results = []
    for post in posts:
        results.append({
            "id": post.id,
            "claim": post.content,
            "title": post.title,
            "status": post.status,
            "official_response": post.verification.official_response if post.verification else "Pending official text.",
            "verified_by": post.department.name if post.department else "Government Admin",
            "updated_at": post.verification.created_at.isoformat() if post.verification else post.created_at.isoformat()
        })
    return results
