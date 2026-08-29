from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Department, Post, Incident, User
from backend.schemas import DepartmentResponse, IncidentResponse, DashboardStats
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["departments"])

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_posts = db.query(Post).count()
    under_review = db.query(Post).filter(Post.status == "UNDER_REVIEW").count()
    
    # Standardised count of verified claims (VERIFIED or LIKELY_TRUE)
    verified = db.query(Post).filter((Post.status == "VERIFIED") | (Post.status == "LIKELY_TRUE")).count()
    
    # False claims (FALSE or LIKELY_FALSE)
    false_claims = db.query(Post).filter((Post.status == "FALSE") | (Post.status == "LIKELY_FALSE")).count()
    
    # Critical emergencies
    critical_incidents = db.query(Post).filter(Post.status == "CRITICAL").count()
    
    return DashboardStats(
        total_posts=total_posts,
        under_review=under_review,
        verified=verified,
        false_claims=false_claims,
        critical_incidents=critical_incidents
    )

@router.get("/dashboard/charts")
def get_chart_data(db: Session = Depends(get_db)):
    """
    Returns metrics formatted for Chart.js.
    """
    # 1. Classification breakdowns
    class_labels = ["VERIFIED", "PARTIALLY_CORRECT", "UNDER_REVIEW", "FALSE", "CRITICAL"]
    class_counts = []
    for label in class_labels:
        count = db.query(Post).filter(Post.status == label).count()
        class_counts.append(count)

    # 2. Workload by Department
    depts = db.query(Department).all()
    dept_labels = [d.name for d in depts]
    dept_workloads = []
    for d in depts:
        count = db.query(Post).filter(Post.department_id == d.id).count()
        dept_workloads.append(count)

    # 3. Incident Trends over last 7 days (Mocked based on seeded data timestamps)
    trends = {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "reports": [12, 19, 15, 25, 32, 28, 45],
        "verifications": [8, 14, 12, 20, 25, 22, 38]
    }

    return {
        "classifications": {
            "labels": class_labels,
            "data": class_counts
        },
        "workloads": {
            "labels": dept_labels,
            "data": dept_workloads
        },
        "trends": trends
    }
