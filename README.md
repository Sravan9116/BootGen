# SENTINEL: Real-Time Government Verified Social Intelligence Platform

SENTINEL is an advanced crisis coordination and social media intelligence platform prototype. It intercepts citizen-generated reports/claims, utilizes artificial intelligence to perform initial classification and department routing, maps coordinates, and enables government officers to compose official truth response updates or geo-targeted critical broadcasts.

---

## 📂 Project Architecture

```
sentinel/
├── backend/
│   ├── services/
│   │   ├── ollama_service.py       # Local Qwen3:8B integration & rule-based fallback
│   │   └── websocket_manager.py    # WS Connection manager for live sync & SOS overlays
│   ├── routers/
│   │   ├── auth.py                 # Civilian & officer authentication
│   │   ├── posts.py                # CRUD claims, AI routing, image analysis background queue
│   │   ├── departments.py          # Dashboard statistics & department list
│   │   ├── alerts.py               # Dispatch alerts & calculate delivery stats
│   │   └── analysis.py             # Official verification verdicts & fact-checking searches
│   ├── database.py                 # SQLite session setup
│   ├── models.py                   # SQLAlchemy DB Tables
│   ├── schemas.py                  # Pydantic schemas validation
│   ├── requirements.txt            # Python requirements
│   └── main.py                     # App startup entry point, DB seeder, and static file server
├── frontend/
│   ├── index.html                  # Futuristic animated landing page
│   ├── pages/
│   │   ├── world-feed.html         # User social feed and composer timeline
│   │   ├── world-chat.html         # Real-time world chat with active AI monitoring
│   │   ├── dashboard.html          # User notification and regional alert deck
│   │   ├── report.html             # Incident report ingestion & tracking timeline
│   │   ├── fact-check.html         # Public rumor vs official truth search
│   │   ├── login.html              # Officer access portal
│   │   ├── admin.html              # Administrator Command Center (Leaflet, Chart.js)
│   │   ├── verification.html       # Split-screen verification workspace
│   │   ├── department.html         # Department Kanban boards
│   │   ├── emergency.html          # Emergency Command Center (active SOS map)
│   │   └── alerts.html             # Targeted alert builder with radius mapping
│   ├── css/
│   │   ├── variables.css           # CSS parameters, colors, shadow, glassmorphism
│   │   ├── reset.css               # Clean spacing overrides
│   │   ├── global.css              # Font families (Inter/Poppins) & dark/light theme grids
│   │   ├── layout.css              # Main flex/grid structures
│   │   ├── components.css          # Badges, timelines, composer, chat bubbles, cards
│   │   ├── animations.css          # Pulse markers, skeleton loading, emergency glow keyframes
│   │   └── responsive.css          # Media queries scaling for tablets/smartphones
│   └── js/
│       ├── api.js                  # Centralized fetch client
│       ├── websocket.js            # WS connection manager & SOS broadcast overlay
│       ├── ui.js                   # Mobile togglers, toast alerts, loading skeleton renderers
│       ├── feed.js                 # World Feed orchestrator
│       ├── chat.js                 # World Chat orchestrator
│       ├── dashboard.js            # Civilian Dashboard filter engine
│       ├── report.js               # Report visual timeline manager
│       ├── admin.js                # Command Center map and Chart.js manager
│       ├── verification.js         # Verdict builder controller
│       ├── emergency.js            # Emergency map manager
│       └── alerts.js               # Targeted radius alert generator
└── README.md                       # Documentation
```

---

## ⚡ Setup & Launch Instructions

### Prerequisites
- Python 3.8 or higher installed on your system.
- Ollama installed locally.

---

### Step 1: Initialize Ollama and Model

1. **Start Ollama** in your background terminal.
2. Confirm that the required model is available by running:
   ```bash
   ollama run qwen3:8b
   ```
   *Note: If `qwen3:8b` is not found, you can download it or allow Sentinel to use its robust built-in fallback rules engine, which behaves exactly like the model offline.*

---

### Step 2: Install Python Dependencies

Open your command prompt in the project root and install requirements:
```bash
pip install -r backend/requirements.txt
```

---

### Step 3: Run the FastAPI Server

Start the backend static server:
```bash
python -m uvicorn backend.main:app --reload
```
Upon launching, the SQLite database is automatically generated at `backend/sentinel.db` and seeded with:
- 8 Default Departments (Water, Traffic, Weather, Disaster, etc.)
- 6 Demo Accounts (Admins & Officers)
- 4 Incident claims in various stages of verification

---

### Step 4: Access the Platform

Open your web browser and navigate to:
```
http://localhost:8000
```
This serves the futuristic **SENTINEL Landing Page**. From there, you can access the social feed or login using the credentials below.

---

## 🔑 Demo Government Credentials

For testing the government workspace, use the credentials below at `http://localhost:8000/pages/login.html`:

| Role / Department | Email | Password |
| :--- | :--- | :--- |
| **Admin Coordinator** | `admin@sentinel.gov` | `admin` |
| **Water Department Staff** | `water@sentinel.gov` | `water` |
| **Traffic Department Staff** | `traffic@sentinel.gov` | `traffic` |
| **Weather Department Staff** | `weather@sentinel.gov` | `weather` |
| **Disaster Management Staff**| `disaster@sentinel.gov` | `disaster` |

---

## 🧪 Complete End-to-End Test Scenarios

### Scenario A: Citizen Submits a Claim
1. Open a browser window to `http://localhost:8000/pages/world-feed.html`.
2. Enter the title: *Severe logging in Adyar Sector*.
3. Enter description: *Water is 3 feet high near Adyar main bridge. Cars cannot pass. Emergency team needed.*
4. Select category: **Flood** and location: **Adyar**. Attach a mock image.
5. Click **Post Report**.
6. Observe the **Neural Routing modal** animation: Pre-processing -> prompting Qwen3:8B -> routing.
7. The card enters the feed with status `UNDER REVIEW` (Blue) and AI tags showing routed to the **Disaster Management** department.

### Scenario B: Government Official Verifies the Claim
1. Open a second browser window (incognito or another browser) to `http://localhost:8000/pages/login.html`.
2. Login with `admin@sentinel.gov` / `admin`.
3. You are redirected to the **Control Room**. Notice the new marker on the Leaflet situation map.
4. Click **Verification Room** in the sidebar. Select the new Case from the top-right dropdown.
5. Review the user post on the left and the AI extraction findings in the center.
6. On the right, select **Partially Correct**. Compose response: *"Adyar bridge is passable on one lane. Disaster response teams are on site pumping out water."*
7. Click **Verify & Broadcast Truth**.
8. Go back to the Citizen window. Notice that **without page refresh**, the post status badge has turned orange `PARTIALLY CORRECT` and displays the official response clarification from the department.

### Scenario C: Firing a Targeted Emergency Alert
1. In the Admin Dashboard sidebar, click **Alert Dispatch**.
2. Click on the Leaflet map to select a targeting coordinate. The map will draw a danger zone circle.
3. Observe the estimation value of affected users update.
4. Enter target location: *Adyar Sector 4* and type warning message.
5. Click **FIRE GEO-TARGETED ALERT**.
6. In the Admin window, observe the delivery counts animate and stack (delivered vs failed vs pending).
7. In the connected Citizen window, a **pulsing, shaking red Emergency SOS Overlay** appears instantly with a tone block and forces the citizen to acknowledge the threat!
