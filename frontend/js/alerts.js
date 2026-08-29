// SENTINEL Alert Dispatcher Console Controller

document.addEventListener('DOMContentLoaded', () => {
    // Authenticate
    const user = API.auth.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        showToast('Access Denied: Admin role required.', 'error');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1000);
        return;
    }

    // Elements
    const alertType = document.getElementById('alert-type');
    const alertSeverity = document.getElementById('alert-severity');
    const alertLocation = document.getElementById('alert-location');
    const alertRadius = document.getElementById('alert-radius');
    const alertMsg = document.getElementById('alert-message');
    const recipientEst = document.getElementById('recipient-estimate');
    const btnFire = document.getElementById('btn-fire-alert');

    // Progress elements
    const progressBox = document.getElementById('delivery-progress-box');
    const progressTotal = document.getElementById('delivery-total-estimate');
    const progDelivered = document.getElementById('progress-delivered');
    const progPending = document.getElementById('progress-pending');
    const progFailed = document.getElementById('progress-failed');
    
    const statsDelivered = document.getElementById('stats-delivered');
    const statsPending = document.getElementById('stats-pending');
    const statsFailed = document.getElementById('stats-failed');

    let map = null;
    let targetCircle = null;
    let clickCoords = [13.0827, 80.2707]; // default center

    // Initialize Map
    function initMap() {
        console.log("Initializing alerts map...");
        map = L.map('alerts-map').setView([13.0827, 80.2707], 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CartoDB',
            maxZoom: 20
        }).addTo(map);

        // Click event listener
        map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            clickCoords = [lat, lng];
            
            updateTargetCircle(lat, lng, parseFloat(alertRadius.value));
            
            // Reverse geocode simulation
            alertLocation.value = `Zone Sector [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
        });
    }

    // Draw/Update target circular zone on map
    function updateTargetCircle(lat, lng, radiusKm) {
        if (!map) return;
        
        if (targetCircle) {
            map.removeLayer(targetCircle);
        }

        const radiusMeters = radiusKm * 1000;
        targetCircle = L.circle([lat, lng], {
            color: 'red',
            fillColor: '#ef4444',
            fillOpacity: 0.25,
            weight: 1.5,
            radius: radiusMeters
        }).addTo(map);
        
        map.panTo([lat, lng]);

        // Update estimates
        const estimation = Math.round(radiusKm * 2800);
        recipientEst.textContent = `${estimation.toLocaleString()} Users`;
    }

    // Handle radius sliding/typing inputs
    alertRadius.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (val && targetCircle) {
            updateTargetCircle(clickCoords[0], clickCoords[1], val);
        }
    });

    // Check URL parameters (from emergency routing)
    function parseQueryParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const loc = urlParams.get('loc');
        const msg = urlParams.get('msg');
        
        if (loc) {
            alertLocation.value = loc;
        }
        if (msg) {
            alertMsg.value = `CRITICAL EMERGENCY WARNING: ${msg}. Avoid the affected area. Local emergency units are deploying. Stand by for official instructions.`;
            alertSeverity.value = 'CRITICAL';
            alertType.value = 'Emergency';
        }
        
        // Render default circle around center
        updateTargetCircle(13.0827, 80.2707, parseFloat(alertRadius.value));
    }

    // Dispatch targeted alert triggers stats simulation
    btnFire.addEventListener('click', async () => {
        const type = alertType.value;
        const severity = alertSeverity.value;
        const location = alertLocation.value.trim();
        const radius = parseFloat(alertRadius.value);
        const message = alertMsg.value.trim();

        // Retrieve checked channels
        const checkedBoxes = document.querySelectorAll('input[name="channel"]:checked');
        const channels = Array.from(checkedBoxes).map(cb => cb.value).join(',');

        if (!location || !message) {
            showToast('Please provide target location and alert details.', 'error');
            return;
        }
        if (!channels) {
            showToast('Please select at least one dissemination channel.', 'error');
            return;
        }

        try {
            const payload = {
                alert_type: type,
                severity: severity,
                location: location,
                radius_km: radius,
                message: message,
                channels: channels
            };

            const result = await API.alerts.send(payload);
            showToast('Alert broadcast launched successfully!', 'success');

            // Render delivery progress
            animateStatsDelivery(result);

        } catch (e) {
            showToast(`Broadcast failed: ${e.message}`, 'error');
        }
    });

    // Simulate animated count up of alert delivery metrics
    function animateStatsDelivery(alert) {
        progressBox.style.display = 'block';
        
        const totalEst = alert.delivered + alert.pending + alert.failed;
        progressTotal.textContent = `0 / ${totalEst.toLocaleString()}`;

        let currentDelivered = 0;
        let currentPending = 0;
        let currentFailed = 0;

        const duration = 2500; // 2.5s duration
        const steps = 50;
        const intervalTime = duration / steps;

        const delStep = alert.delivered / steps;
        const penStep = alert.pending / steps;
        const failStep = alert.failed / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            currentDelivered = Math.min(alert.delivered, Math.round(delStep * currentStep));
            currentPending = Math.min(alert.pending, Math.round(penStep * currentStep));
            currentFailed = Math.min(alert.failed, Math.round(failStep * currentStep));

            const currentSum = currentDelivered + currentPending + currentFailed;
            progressTotal.textContent = `${currentSum.toLocaleString()} / ${totalEst.toLocaleString()} Dispatched`;

            // Update text widgets
            statsDelivered.textContent = currentDelivered.toLocaleString();
            statsPending.textContent = currentPending.toLocaleString();
            statsFailed.textContent = currentFailed.toLocaleString();

            // Update progress bar percentage segments
            const pctDelivered = (currentDelivered / totalEst) * 100;
            const pctPending = (currentPending / totalEst) * 100;
            const pctFailed = (currentFailed / totalEst) * 100;

            progDelivered.style.width = `${pctDelivered}%`;
            progPending.style.width = `${pctPending}%`;
            progFailed.style.width = `${pctFailed}%`;

            if (currentStep >= steps) {
                clearInterval(timer);
                statsDelivered.textContent = alert.delivered.toLocaleString();
                statsPending.textContent = alert.pending.toLocaleString();
                statsFailed.textContent = alert.failed.toLocaleString();
                progressTotal.textContent = `${totalEst.toLocaleString()} / ${totalEst.toLocaleString()} Dispatched (Completed)`;
            }
        }, intervalTime);
    }

    // Initialize
    initMap();
    parseQueryParameters();
});
