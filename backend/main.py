from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import os
import json

from backend.database import engine, Base, get_db, SessionLocal
from backend.models import User, Department, Post, Message, AiAnalysis, Verification, Incident, AuditLog
from backend.routers import auth, posts, departments, alerts, analysis
from backend.services.websocket_manager import manager

app = FastAPI(title="SENTINEL - Social Intelligence Platform API")

# Enable CORS for local cross-origin testing if pages are opened directly from file system
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(departments.router)
app.include_router(alerts.router)
app.include_router(analysis.router)

@app.get("/api/messages")
def get_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).order_by(Message.created_at.asc()).all()
    return [
        {
            "id": msg.id,
            "content": msg.content,
            "image_url": msg.image_url,
            "created_at": msg.created_at.isoformat(),
            "user": {
                "id": msg.user.id,
                "username": msg.user.username,
                "role": msg.user.role
            }
        }
        for msg in messages
    ]

@app.get("/assets/images/flood.jpg")
def get_flood_image():
    return RedirectResponse("https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80")

@app.get("/assets/images/accident.jpg")
def get_accident_image():
    return RedirectResponse("https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80")

# WebSocket connection endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Identify message type
            msg_type = message_data.get("type")
            
            if msg_type == "SEND_MESSAGE":
                user_id = message_data.get("user_id", 1)
                content = message_data.get("content", "").strip()
                image_url = message_data.get("image_url")
                
                if not content:
                    continue
                
                # Retrieve user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    continue
                
                # Save message to database
                db_msg = Message(user_id=user.id, content=content, image_url=image_url)
                db.add(db_msg)
                db.commit()
                db.refresh(db_msg)
                
                # Broadcast message to all connected clients
                await manager.broadcast({
                    "type": "NEW_MESSAGE",
                    "message": {
                        "id": db_msg.id,
                        "content": db_msg.content,
                        "image_url": db_msg.image_url,
                        "created_at": db_msg.created_at.isoformat(),
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "role": user.role
                        }
                    }
                })
                
            elif msg_type == "TYPING":
                username = message_data.get("username", "Someone")
                is_typing = message_data.get("is_typing", False)
                # Broadcast typing status (exclude sender to avoid echo on UI)
                await manager.broadcast({
                    "type": "USER_TYPING",
                    "username": username,
                    "is_typing": is_typing
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Seeding logic to populate default departments and dummy data
def seed_database():
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Department).count() > 0:
            return

        print("Seeding initial data...")
        
        # 1. Seed Departments
        departments_data = [
            ("Traffic Department", "TRAFFIC"),
            ("Water Department", "WATER"),
            ("Weather Department", "WEATHER"),
            ("Health Department", "HEALTH"),
            ("Disaster Management", "DISASTER"),
            ("Police / Public Safety", "POLICE"),
            ("Electricity Department", "ELECTRICITY"),
            ("Other Departments", "OTHER")
        ]
        
        depts = {}
        for name, code in departments_data:
            dept = Department(name=name, code=code)
            db.add(dept)
            db.flush()
            depts[code] = dept

        # 2. Seed Users
        users_data = [
            ("civilian_user", "civilian@sentinel.gov", "password", "USER", None),
            ("admin_coordinator", "admin@sentinel.gov", "admin", "ADMIN", None),
            ("water_officer", "water@sentinel.gov", "water", "STAFF", depts["WATER"].id),
            ("traffic_officer", "traffic@sentinel.gov", "traffic", "STAFF", depts["TRAFFIC"].id),
            ("weather_officer", "weather@sentinel.gov", "weather", "STAFF", depts["WEATHER"].id),
            ("disaster_officer", "disaster@sentinel.gov", "disaster", "STAFF", depts["DISASTER"].id)
        ]
        
        users = []
        for username, email, pwd, role, dept_id in users_data:
            user = User(username=username, email=email, password_hash=pwd, role=role, department_id=dept_id)
            db.add(user)
            db.flush()
            users.append(user)
            
        civilian = users[0]
        admin = users[1]
        water_staff = users[2]
        traffic_staff = users[3]
        weather_staff = users[4]

        # 3. Seed Posts (Claims) with different statuses
        
        # Seed 1: Verified Water Outage Post
        post1 = Post(
            user_id=civilian.id,
            title="Water supply stopped in Zone 3",
            content="Is it true that there will be no water supply in Zone 3 tomorrow? I heard the main pipeline leaked.",
            category="Water Supply",
            location="Zone 3",
            latitude=13.0406,
            longitude=80.2337,
            status="VERIFIED",
            department_id=depts["WATER"].id
        )
        db.add(post1)
        db.flush()
        
        ai1 = AiAnalysis(
            post_id=post1.id,
            summary="User inquiry on water pipeline leakage and supply stoppage in Zone 3.",
            topic="Water Supply",
            classification="UNDER_REVIEW",
            confidence=88,
            urgency="LOW",
            recommended_department_id=depts["WATER"].id,
            location="Zone 3",
            reason="Content contains keywords related to water supply, pipeline and leaks."
        )
        db.add(ai1)
        
        ver1 = Verification(
            post_id=post1.id,
            verifier_id=water_staff.id,
            status="VERIFIED",
            official_response="Water supply is temporarily suspended in Zone 3 due to pipeline maintenance. Regular supply will resume by 8:00 PM tomorrow. Water tankers have been deployed."
        )
        db.add(ver1)
        
        incident1 = Incident(
            title=post1.title,
            description=post1.content,
            category=post1.category,
            location=post1.location,
            severity="LOW",
            status="OFFICIAL_RESPONSE",
            post_id=post1.id
        )
        db.add(incident1)

        # Seed 2: Partially Correct Traffic Accident
        post2 = Post(
            user_id=civilian.id,
            title="Massive road block near Highway 45",
            content="There is a multi-car collision near Highway 45 exit. The entire road is blocked and traffic is backed up for miles!",
            category="Accident",
            location="Highway 45",
            latitude=13.0104,
            longitude=80.2156,
            status="PARTIALLY_CORRECT",
            department_id=depts["TRAFFIC"].id
        )
        db.add(post2)
        db.flush()
        
        ai2 = AiAnalysis(
            post_id=post2.id,
            summary="User reports a multi-car accident causing severe traffic blockage on Highway 45.",
            topic="Traffic Accident",
            classification="UNDER_REVIEW",
            confidence=92,
            urgency="HIGH",
            recommended_department_id=depts["TRAFFIC"].id,
            location="Highway 45",
            reason="Accident report with high traffic congestion warnings."
        )
        db.add(ai2)
        
        ver2 = Verification(
            post_id=post2.id,
            verifier_id=traffic_staff.id,
            status="PARTIALLY_CORRECT",
            official_response="A minor two-car collision occurred on Highway 45. One lane is blocked, causing moderate slowdowns. Traffic police are on-site clearing the vehicles. Complete blockage claims are false."
        )
        db.add(ver2)
        
        incident2 = Incident(
            title=post2.title,
            description=post2.content,
            category=post2.category,
            location=post2.location,
            severity="HIGH",
            status="OFFICIAL_RESPONSE",
            post_id=post2.id
        )
        db.add(incident2)

        # Seed 3: False Weather Rumor
        post3 = Post(
            user_id=civilian.id,
            title="Red Alert issued for tomorrow",
            content="URGENT! A severe cyclone is expected to hit the city center tomorrow morning. Red alert has been declared, stay indoors!",
            category="Rain",
            location="City Center",
            latitude=13.0827,
            longitude=80.2707,
            status="FALSE",
            department_id=depts["WEATHER"].id
        )
        db.add(post3)
        db.flush()
        
        ai3 = AiAnalysis(
            post_id=post3.id,
            summary="User claims a severe cyclone and official red alert for tomorrow morning.",
            topic="Cyclone / Storm",
            classification="UNDER_REVIEW",
            confidence=68,
            urgency="HIGH",
            recommended_department_id=depts["WEATHER"].id,
            location="City Center",
            reason="High panic content alerting citizens of weather emergency."
        )
        db.add(ai3)
        
        ver3 = Verification(
            post_id=post3.id,
            verifier_id=weather_staff.id,
            status="FALSE",
            official_response="No Red Alert or cyclone warnings have been issued. Light to moderate rainfall is expected tomorrow. Please do not spread false information."
        )
        db.add(ver3)
        
        incident3 = Incident(
            title=post3.title,
            description=post3.content,
            category=post3.category,
            location=post3.location,
            severity="HIGH",
            status="OFFICIAL_RESPONSE",
            post_id=post3.id
        )
        db.add(incident3)

        # Seed 4: Critical Active Emergency (Under Review)
        post4 = Post(
            user_id=civilian.id,
            title="Anna Nagar under water - People trapped",
            content="Flood water has reached 4 feet height near Anna Nagar West. Multiple families are trapped on the first floor. We need rescue teams immediately!",
            category="Flood",
            location="Anna Nagar",
            latitude=13.0850,
            longitude=80.2101,
            status="UNDER_REVIEW",
            department_id=depts["DISASTER"].id
        )
        db.add(post4)
        db.flush()
        
        ai4 = AiAnalysis(
            post_id=post4.id,
            summary="Critical flooding reported in Anna Nagar with residents trapped inside their homes.",
            topic="Flooding Rescue",
            classification="UNDER_REVIEW",
            confidence=86,
            urgency="CRITICAL",
            recommended_department_id=depts["DISASTER"].id,
            location="Anna Nagar",
            reason="High distress text indicating waterlogging and trapped civilians."
        )
        db.add(ai4)
        
        incident4 = Incident(
            title=post4.title,
            description=post4.content,
            category=post4.category,
            location=post4.location,
            severity="CRITICAL",
            status="ROUTED",
            post_id=post4.id
        )
        db.add(incident4)

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

# Startup event
@app.on_event("startup")
def startup_event():
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    seed_database()

# Static serving of frontend files
# Resolve frontend folder path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_path = os.path.join(project_root, "frontend")

if os.path.exists(frontend_path):
    # Mount the /pages folder for specific page navigation
    app.mount("/pages", StaticFiles(directory=os.path.join(frontend_path, "pages")), name="pages")
    # Mount css, js, assets directories
    for folder in ["css", "js", "assets"]:
        folder_path = os.path.join(frontend_path, folder)
        if os.path.exists(folder_path):
            app.mount(f"/{folder}", StaticFiles(directory=folder_path), name=folder)

    # Serve the main landing page at / and /index.html
    @app.get("/")
    def get_index():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/index.html")
    def get_index_html():
        return FileResponse(os.path.join(frontend_path, "index.html"))
else:
    print(f"Warning: Frontend directory not found at {frontend_path}.")
