// SENTINEL Personal Dashboard Controller

document.addEventListener('DOMContentLoaded', () => {
    const bulletinsList = document.getElementById('dashboard-bulletins-list');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let allAlerts = [];
    let allPosts = [];
    let activeFilter = 'all';

    // Fetch initial alerts and posts
    async function loadDashboardData() {
        renderSkeleton(bulletinsList, 3);
        try {
            // Fetch geo-targeted alerts
            allAlerts = await API.alerts.getAll();
            // Fetch posts
            allPosts = await API.posts.getAll();

            renderBulletins();
        } catch (e) {
            bulletinsList.innerHTML = `<div class="card text-center text-danger p-3">Failed to load bulletins. (${e.message})</div>`;
        }
    }

    // Render alerts/posts cards based on active filter
    function renderBulletins() {
        bulletinsList.innerHTML = '';
        
        let filteredItems = [];

        if (activeFilter === 'all') {
            // Combine both alerts and posts
            allAlerts.forEach(a => filteredItems.push({ type: 'ALERT', data: a, date: new Date(a.created_at) }));
            allPosts.forEach(p => filteredItems.push({ type: 'POST', data: p, date: new Date(p.created_at) }));
        } else if (activeFilter === 'emergency') {
            // Only alerts or critical posts
            allAlerts.forEach(a => filteredItems.push({ type: 'ALERT', data: a, date: new Date(a.created_at) }));
            allPosts.filter(p => p.status === 'CRITICAL').forEach(p => filteredItems.push({ type: 'POST', data: p, date: new Date(p.created_at) }));
        } else if (activeFilter === 'verified') {
            // Verified or Likely True posts
            allPosts.filter(p => p.status === 'VERIFIED' || p.status === 'LIKELY_TRUE').forEach(p => filteredItems.push({ type: 'POST', data: p, date: new Date(p.created_at) }));
        } else if (activeFilter === 'false') {
            // False or Likely False posts
            allPosts.filter(p => p.status === 'FALSE' || p.status === 'LIKELY_FALSE').forEach(p => filteredItems.push({ type: 'POST', data: p, date: new Date(p.created_at) }));
        }

        // Sort items by date descending
        filteredItems.sort((a, b) => b.date - a.date);

        if (filteredItems.length === 0) {
            bulletinsList.innerHTML = '<div class="card text-center p-3 text-muted" data-i18n="no_bulletins_msg">No matching bulletins found.</div>';
            if (window.applyTranslations && window.currentLang) {
                window.applyTranslations(window.currentLang);
            }
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            
            if (item.type === 'ALERT') {
                const alert = item.data;
                card.className = `card alert-card-item severity-${alert.severity} animate-msg-appear`;
                card.style.marginBottom = '1rem';
                card.innerHTML = `
                    <div class="post-header" style="margin-bottom:0.5rem;">
                        <h4 style="font-size:0.95rem; color:var(--color-critical); display:flex; align-items:center; gap:0.4rem;">
                            ⚠️ <span data-i18n="emergency_alert_prefix">EMERGENCY ALERT</span>: <span data-i18n="${alert.alert_type.toLowerCase()}">${alert.alert_type}</span>
                        </h4>
                        <span class="badge badge-critical">${alert.severity}</span>
                    </div>
                    <p style="font-size:0.9rem; line-height:1.5; font-weight: 500; margin-bottom: 0.75rem;">
                        ${alert.message}
                    </p>
                    <div style="font-size:0.75rem; display:flex; justify-content:between;" class="text-muted">
                        <span><span data-i18n="target_prefix">Target</span>: ${alert.location} (+${alert.radius_km}km)</span>
                        <span>${new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                `;
            } else {
                const post = item.data;
                card.className = 'card animate-msg-appear';
                card.style.marginBottom = '1rem';
                
                const isPending = !(post.verification && post.verification.official_response);
                const officialText = isPending ? 'Pending verification review.' : post.verification.official_response;
                const deptName = post.department ? post.department.name : 'Government Authority';
                const deptKey = deptName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                
                card.innerHTML = `
                    <div class="post-header" style="margin-bottom: 0.5rem;">
                        <h4 style="font-size:0.95rem; font-family:'Poppins';">
                            📌 <span data-i18n="public_claim_prefix">Public Claim</span>: ${post.title}
                        </h4>
                        <span class="badge ${getStatusBadgeClass(post.status)}">${post.status.replace('_', ' ')}</span>
                    </div>
                    <p style="font-size:0.85rem; font-style:italic; margin-bottom: 0.75rem;" class="text-muted">
                        "${post.content}"
                    </p>
                    <div style="padding: 0.8rem; background:rgba(0,0,0,0.02); border-radius:var(--border-radius); border-left:3px solid var(--color-secondary); font-size:0.85rem;">
                        <strong><span data-i18n="${deptKey}">${deptName}</span> <span data-i18n="status_update_suffix">Status Update</span>:</strong><br>
                        <span ${isPending ? 'data-i18n="pending_verification"' : ''}>${officialText}</span>
                    </div>
                    <div style="font-size:0.75rem; text-align:right; margin-top:0.5rem;" class="text-muted">
                        ${new Date(post.created_at).toLocaleString()}
                    </div>
                `;
            }
            
            bulletinsList.appendChild(card);
        });

        // Trigger translation update for the newly added dashboard items
        if (window.applyTranslations && window.currentLang) {
            window.applyTranslations(window.currentLang);
        }
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case 'UNDER_REVIEW': return 'badge-under-review';
            case 'LIKELY_TRUE': return 'badge-likely-true';
            case 'PARTIALLY_CORRECT': return 'badge-partially-correct';
            case 'LIKELY_FALSE': return 'badge-likely-false';
            case 'VERIFIED': return 'badge-verified';
            case 'FALSE': return 'badge-false';
            case 'CRITICAL': return 'badge-critical';
            default: return 'badge-under-review';
        }
    }

    // Filter click handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderBulletins();
        });
    });

    // Real-Time Socket binding
    WS.on('CRITICAL_ALERT_BROADCAST', (data) => {
        allAlerts.unshift(data.alert);
        if (activeFilter === 'all' || activeFilter === 'emergency') {
            renderBulletins();
        }
        showToast('New Emergency Bulletin published.');
    });

    WS.on('POST_VERIFIED', (data) => {
        // Find and update the post locally
        const post = allPosts.find(p => p.id === data.post_id);
        if (post) {
            post.status = data.status;
            post.verification = { official_response: data.official_response };
            renderBulletins();
        } else {
            // Reload entire queue if not in cache
            loadDashboardData();
        }
    });

    // Load data
    loadDashboardData();
});
