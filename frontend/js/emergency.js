// SENTINEL Secure Emergency Command Center Controller

document.addEventListener('DOMContentLoaded', () => {
    // Authenticate
    const user = API.auth.getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
        showToast('Access Denied: Command credentials required.', 'error');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1000);
        return;
    }

    // Elements
    const emergenciesList = document.getElementById('active-emergencies-list');

    let map = null;
    let markers = {};
    let activeEmergencies = [];

    // Initialize Map
    function initMap() {
        console.log("Initializing emergency map...");
        map = L.map('emergency-map').setView([13.0827, 80.2707], 12);
        
        // Dark grid tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CartoDB',
            maxZoom: 20
        }).addTo(map);
    }

    // Add pulsing emergency marker
    function addEmergencyMarker(post) {
        if (!map) return;

        const lat = post.latitude || 13.0827;
        const lon = post.longitude || 80.2707;

        const marker = L.circleMarker([lat, lon], {
            radius: 12,
            fillColor: '#ff007f',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <div style="color:#0f172a; font-family:'Inter'; font-size:0.8rem; width:200px;">
                <h4 style="font-weight:600; color:var(--color-critical); font-size:0.85rem; margin-bottom:0.25rem;">⚠️ CRITICAL: ${post.title}</h4>
                <p style="font-size:0.75rem; margin-bottom:0.5rem;" class="text-muted">${post.location}</p>
                <div style="display:flex; justify-content:between; align-items:center;">
                    <a href="/pages/verification.html?id=${post.id}" style="color:var(--color-secondary); font-size:0.75rem; font-weight:600;">
                        Open Command Panel ➡️
                    </a>
                </div>
            </div>
        `);

        markers[post.id] = marker;
    }

    // Load Emergency Queue
    async function loadEmergencies() {
        try {
            const posts = await API.posts.getAll();
            
            // Filter posts that are marked CRITICAL or have high urgency AI pre-classification and are still under review
            activeEmergencies = posts.filter(p => 
                p.status === 'CRITICAL' || 
                (p.ai_analysis && p.ai_analysis.urgency === 'CRITICAL') ||
                p.category === 'Flood' || p.category === 'Fire'
            );

            // Populate Map Markers
            activeEmergencies.forEach(post => addEmergencyMarker(post));

            // Populate List
            renderEmergenciesList();

        } catch (e) {
            showToast('Failed to load emergency dispatches queue.', 'error');
        }
    }

    // Render list cards in sidebar
    function renderEmergenciesList() {
        emergenciesList.innerHTML = '';
        
        // Filter out resolved posts (only show under review or critical status)
        const activeItems = activeEmergencies.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'CRITICAL');

        if (activeItems.length === 0) {
            emergenciesList.innerHTML = '<div class="text-muted" style="font-size:0.85rem; padding:1rem; text-align:center;">No active critical emergencies.</div>';
            return;
        }

        activeItems.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card animate-emergency-pulse';
            card.id = `emergency-card-${post.id}`;
            card.style.padding = '1.2rem';
            card.style.border = '1px solid rgba(220,38,38,0.3)';
            card.style.color = 'white';
            
            card.innerHTML = `
                <div style="display:flex; justify-content:between; align-items:center; margin-bottom:0.5rem;">
                    <h4 style="font-size:0.9rem; font-family:'Poppins'; font-weight:700;">⚠️ ${post.category.toUpperCase()} IN PROGRESS</h4>
                    <span class="badge badge-critical" style="font-size:0.65rem;">CRITICAL</span>
                </div>
                <p style="font-size:0.85rem; font-weight:500; margin-bottom:0.25rem;">${post.title}</p>
                <p style="font-size:0.75rem; opacity:0.8; margin-bottom:1rem;" class="text-muted">
                    Location: ${post.location} • Submitted: ${new Date(post.created_at).toLocaleTimeString()}
                </p>
                <div style="display:flex; justify-content:between; gap:0.5rem; flex-wrap:wrap;">
                    <button class="btn btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.6rem;" onclick="escalateCase(${post.id})">⚡ Escalate</button>
                    <button class="btn btn-primary" style="font-size:0.75rem; padding:0.35rem 0.6rem; background-color:var(--color-success);" onclick="resolveCase(${post.id})">✅ Resolve</button>
                    <a href="/pages/alerts.html?id=${post.id}&loc=${encodeURIComponent(post.location)}&msg=${encodeURIComponent(post.title)}" class="btn btn-danger" style="font-size:0.75rem; padding:0.35rem 0.6rem;">📢 Send Alert</a>
                </div>
            `;
            
            emergenciesList.appendChild(card);
        });
    }

    // Resolve case directly (Verify as True)
    window.resolveCase = async function(postId) {
        try {
            await API.verification.submit(postId, 'VERIFIED', 'Resolved by emergency services team. Situation cleared.');
            showToast(`Case #${postId} marked as resolved.`, 'success');
            
            // Remove from active list locally
            activeEmergencies = activeEmergencies.filter(e => e.id !== postId);
            renderEmergenciesList();
            
            // Adjust marker on map
            const marker = markers[postId];
            if (marker) {
                marker.setStyle({ fillColor: '#10b981' }); // Change to verified green
            }
        } catch(err) {
            showToast(`Resolution failed: ${err.message}`, 'error');
        }
    };

    // Escalate case urgency
    window.escalateCase = function(postId) {
        showToast(`Broadcasting escalation protocols for Case #${postId}`, 'warning');
        // Simulate shake and red flashes on viewport
        document.body.style.animation = 'glow 0.5s 3 alternate';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 1500);
    };

    // WebSocket Listeners
    WS.on('NEW_POST', (data) => {
        const post = data.post;
        
        // If incoming post is urgent, alert emergency command center
        if (post.ai_analysis && (post.ai_analysis.urgency === 'CRITICAL' || post.ai_analysis.urgency === 'HIGH')) {
            showToast(`🚨 ALERT DETECTED: ${post.title}`, 'error');
            
            // Add marker & append to list
            addEmergencyMarker(post);
            activeEmergencies.unshift(post);
            renderEmergenciesList();
        }
    });

    // Initalize
    initMap();
    loadEmergencies();
});
