from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Alert, User, AuditLog
from backend.schemas import AlertCreate, AlertResponse
from backend.services.websocket_manager import manager
import random
from typing import List, Optional

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()

@router.post("", response_model=AlertResponse)
async def create_alert(
    alert_in: AlertCreate,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = 1
    if x_user_id:
        try:
            user_id = int(x_user_id)
        except ValueError:
            pass

    sender = db.query(User).filter(User.id == user_id).first()
    if not sender or sender.role != "ADMIN":
        # For prototype fallback, allow admin simulation
        sender = db.query(User).filter(User.role == "ADMIN").first()
        if not sender:
            raise HTTPException(status_code=403, detail="Only administration can dispatch alerts.")

    # Calculate realistic delivery metrics based on target radius
    multiplier = random.randint(1500, 3000)
    total_users_affected = int(alert_in.radius_km * multiplier)
    
    delivered = int(total_users_affected * random.uniform(0.85, 0.95))
    failed = int(total_users_affected * random.uniform(0.02, 0.05))
    pending = total_users_affected - delivered - failed

    alert = Alert(
        sender_id=sender.id,
        alert_type=alert_in.alert_type,
        severity=alert_in.severity,
        location=alert_in.location,
        radius_km=alert_in.radius_km,
        message=alert_in.message,
        channels=alert_in.channels,
        delivered=delivered,
        pending=pending,
        failed=failed
    )
    
    db.add(alert)
    
    # Audit log
    audit = AuditLog(
        user_id=sender.id,
        action="DISPATCH_EMERGENCY_ALERT",
        details=f"Alert sent to {alert_in.location} ({alert_in.radius_km}km radius) via {alert_in.channels}. Est. recipients: {total_users_affected}."
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    # Broadcast emergency alert to all active user clients via WebSockets
    await manager.broadcast({
        "type": "CRITICAL_ALERT_BROADCAST",
        "alert": {
            "id": alert.id,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "location": alert.location,
            "radius_km": alert.radius_km,
            "message": alert.message,
            "channels": alert.channels.split(","),
            "created_at": alert.created_at.isoformat()
        }
    })

    return alert
