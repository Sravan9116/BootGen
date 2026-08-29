# SENTINEL - Citizen Safety & Information Integrity Platform
## User Guide & Platform Documentation

Welcome to **SENTINEL**, a premium, state-of-the-art citizen emergency routing, information verification, and crowd-sourced warning broadcast platform. 

This guide details how to use and test the SENTINEL interface. It describes all citizen, administrator, and department officer features.

---

## 1. Accessing the Platform

SENTINEL contains pre-configured test credentials to allow immediate testing of all routing workflows:

| Role | Username / Email | Password | Assigned Department / Area |
| :--- | :--- | :--- | :--- |
| **Citizen (Default User)** | `civilian@sentinel.gov` | `password` | Public User Platform |
| **Admin Coordinator** | `admin@sentinel.gov` | `admin` | Global Control Room |
| **Media Verification Officer** | `media@sentinel.gov` | `media` | Media Verification Bureau |
| **Water Department Staff** | `water@sentinel.gov` | `water` | Water Department |
| **Traffic Department Staff** | `traffic@sentinel.gov` | `traffic` | Traffic Department |
| **Weather Department Staff** | `weather@sentinel.gov` | `weather` | Weather Department |
| **Disaster Coordinator** | `disaster@sentinel.gov` | `disaster` | Disaster Management |

---

## 2. Citizen Platform Features

Citizens can access the public portal to query regional safety details, chat, and flag local incidents.

### A. Sharing a Claim (World Feed)
1. Navigate to the **World Feed** page.
2. In the **Composer Card** at the top of the feed:
   - Type a single-line summary of the incident/claim.
   - Describe the situation, category, and specific location.
   - **Attach a Photo:** Use your local file selector to select and display a preview image instantly.
   - Click **Post Report**.
3. Upon submission, you will see a **Neural Processing Timeline Animation** simulating the 5 stages of forensic verification and AI routing.
4. Once completed, your claim will appear live in the World Feed.

### B. Verified Media Outlet Publications
*   If you are publishing a report that originates from an official news channel, check the **"Share as Verified Media/News Outlet"** checkbox in the composer.
*   Type the outlet name (e.g. *Sentinel News*).
*   When submitted, this post is automatically assigned to the **Media Verification Bureau** and rated with a high AI confidence score (e.g., **96%**). It is visibly tagged with a green media tag.

### C. Likes, Comments, and Sharing
*   **Likes:** Click **Like** on any post card to register your vote. The likes count updates live.
*   **Comments:** Click **Comment** to toggle the discussion drawer. Type your response and hit **Post** (or press Enter) to append your message instantly.
*   **Share:** Click **Share** to automatically copy a formatted emergency warning snippet to your clipboard.

### D. Participating in World Chat
1. Go to the **World Chat** page.
2. Type a message in the public chat input.
3. **Upload Photo:** Click the **Upload Photo** button, select an image from your device, and see the attachment preview instantly.
4. Click **Send** to broadcast your message.
5. *Note:* If serverless deployment is active, a real-time polling fallback automatically synchronizes new messages every 3 seconds if WebSockets are offline.

### E. Reporting a Formal Incident
*   Fill in the formal form in the **Report Incident** section.
*   Provide description, category, and exact location.
*   Submit to route the hazard directly to the relevant municipal department.

---

## 3. World Feed Claims vs. Incident Reports: What is the Difference?

To ensure effective coordination, SENTINEL categorizes citizen reports into two distinct channels:

### 1. World Feed Section (Share a Claim / Incident Report)
*   **Purpose:** Crowd-sourced, social-media-style micro-blogging. It is designed for public sharing of unverified claims, localized alerts, or rumors.
*   **Visibility:** Live immediately on the public feed. Anyone can read, comment on, like, or share it.
*   **Processing:** AI automatically classifies the post topic and assigns it to a suggested municipal department for review while it remains a public social-feed entry.

### 2. Report Incident Page (Formal Ingestion Form)
*   **Purpose:** A formal Municipal Incident Dispatch system. It is designed to report active, verified emergencies directly to city services (like a fire, water main break, or road blockage).
*   **Visibility:** Submitted directly to the internal Government Control Room. It is not open to public comments/likes.
*   **Processing:** Triggers structured status updates (Ingested -> AI Assessed -> Department Assigned -> Under Review -> Official Clarification) and shows progress tracking on the citizen's personal dashboard.

---

## 4. Government Portal & Municipal Control

Municipal department officers can log in to view active incidents, coordinate response measures, and dispatch official communications.

### A. The Control Room
*   Provides a unified dashboard of all active claims, routed departments, and current verification status across the city.
*   Allows Admin Coordinators to manually reroute claims to appropriate departments.

### B. Verification Room & Official Response
*   Officers can review incoming claims routed to their department.
*   Select a claim and write an **Official Response / Clarification**.
*   Upon submission, the clarification is pinned to the top of the civilian feed card, immediately notifying the public.

### C. Alert Dispatch
*   Allows coordinates to send targeted broadcasts (Emergency SOS, SMS, Whatsapp, In-App) to citizens within a specified radius of a hazard.

---

## 5. Media Verification Bureau & Duplicate Rumor Escalation Engine

The Media Verification Bureau (`MEDIA` department code) acts as a rumor filter and crowdsourced warning trigger.

### 1. Semantic Similarity Checking
*   When a new post is submitted, the backend compares its text content and location against all active claims.
*   If the similarity score exceeds **45%**:
    - If a matching verified news outlet post exists, the new post is auto-linked as **Similar to Event** and routed to the Media Bureau.
    - If it contradicts the verified event, it is filtered as a **Fake** or **Rumor**.

### 2. Priority Escalation Warnings (No Verification Delay)
*   If multiple independent citizens submit reports about the *same unverified hazard*:
    - The duplicate count increments on the original post.
    - Once the duplicate count reaches **3 reports**, the event status is automatically upgraded to **`CRITICAL`**.
    - An immediate emergency alert warning broadcast is auto-dispatched to all registered test phone numbers in the environment.
    - **Goal:** Dispatches safety alerts instantly, allowing citizens to take action *before* official administrative verification introduces delays.

---

## 6. Multilingual Support (i18n)

SENTINEL is fully localized. Toggle between the following languages using the custom dropdown in the sidebar (or landing page header):
*   **English**
*   **Hindi (हिंदी)**
*   **Telugu (తెలుగు)**
*   **Tamil (தமிழ்)**
*   **Malayalam (മലയാളം)**

Once selected, all static labels, navigation buttons, alert templates, and badge indicators translate dynamically and persist across page navigation.
