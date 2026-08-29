// SENTINEL Secure Government Admin Core Controller

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = API.auth.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        showToast('Access Denied: Admin authorization required.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    // Elements
    const totalPostsEl = document.getElementById('stat-total-posts');
    const underReviewEl = document.getElementById('stat-under-review');
    const verifiedEl = document.getElementById('stat-verified');
    const falseClaimsEl = document.getElementById('stat-false-claims');
    const criticalEl = document.getElementById('stat-critical');
    
    const reportsTbody = document.getElementById('admin-reports-tbody');
    const aiLogsContainer = document.getElementById('ai-logs-container');

    let map = null;
    let markers = {};
    let classificationChart = null;
    let workloadChart = null;
    let departments = [];

    // Initialize Leaflet Map
    function initMap() {
        console.log("Initializing map...");
        // Center on Chennai
        map = L.map('admin-map').setView([13.0827, 80.2707], 12);
        
        // Add dark tile layer for premium command center look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CartoDB',
            maxZoom: 20
        }).addTo(map);
    }

    // Get color code by status
    function getStatusColor(status) {
        switch(status) {
            case 'VERIFIED': return '#10b981';
            case 'LIKELY_TRUE': return '#10b981';
            case 'PARTIALLY_CORRECT': return '#f59e0b';
            case 'LIKELY_FALSE': return '#ef4444';
            case 'FALSE': return '#ef4444';
            case 'CRITICAL': return '#ff007f';
            default: return '#3b82f6';
        }
    }

    // Add marker to map
    function addMapMarker(post) {
        if (!map) return;
        
        const lat = post.latitude || 13.0827;
        const lon = post.longitude || 80.2707;
        const color = getStatusColor(post.status);
        
        // Custom circular marker
        const marker = L.circleMarker([lat, lon], {
            radius: post.status === 'CRITICAL' ? 10 : 7,
            fillColor: color,
            color: '#fff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        // Bind Popup
        marker.bindPopup(`
            <div style="color:#0f172a; font-family:'Inter'; font-size:0.8rem; width:200px;">
                <h4 style="font-weight:600; font-size:0.85rem; margin-bottom:0.25rem;">${post.title}</h4>
                <p style="font-size:0.75rem; margin-bottom:0.5rem;" class="text-muted">${post.location}</p>
                <div style="display:flex; justify-content:between; align-items:center; margin-top:0.5rem;">
                    <span style="padding:0.15rem 0.4rem; border-radius:3px; background:${color}; color:white; font-size:0.65rem; font-weight:700;">
                        ${post.status.replace('_', ' ')}
                    </span>
                    <a href="verification.html?id=${post.id}" style="color:var(--color-secondary); font-size:0.7rem; font-weight:600;">
                        Review Case ➡️
                    </a>
                </div>
            </div>
        `);

        // Cache marker object
        markers[post.id] = marker;
    }

    // Load static metrics and charts
    async function loadStats() {
        try {
            const stats = await API.dashboard.getStats();
            totalPostsEl.textContent = stats.total_posts;
            underReviewEl.textContent = stats.under_review;
            verifiedEl.textContent = stats.verified;
            falseClaimsEl.textContent = stats.false_claims;
            criticalEl.textContent = stats.critical_incidents;
        } catch(e) {
            console.error("Failed to load dashboard statistics:", e);
        }
    }

    async function loadCharts() {
        try {
            const data = await API.dashboard.getCharts();
            renderCharts(data);
        } catch(e) {
            console.error("Failed to render charts:", e);
        }
    }

    function renderCharts(chartData) {
        // 1. Classification doughnut
        const classCtx = document.getElementById('chart-classifications').getContext('2d');
        if (classificationChart) classificationChart.destroy();
        
        classificationChart = new Chart(classCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.classifications.labels.map(l => l.replace('_', ' ')),
                datasets: [{
                    data: chartData.classifications.data,
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ff007f'],
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', font: { size: 10 } }
                    }
                }
            }
        });

        // 2. Department workloads bar chart
        const workCtx = document.getElementById('chart-workloads').getContext('2d');
        if (workloadChart) workloadChart.destroy();
        
        workloadChart = new Chart(workCtx, {
            type: 'bar',
            data: {
                labels: chartData.workloads.labels.map(l => l.replace(' Department', '')),
                datasets: [{
                    label: 'Routed Tasks',
                    data: chartData.workloads.data,
                    backgroundColor: 'rgba(0, 112, 243, 0.65)',
                    borderColor: 'var(--color-secondary)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.03)' } }
                }
            }
        });
    }

    // Populate data queues
    async function loadQueues() {
        try {
            // Load departments list first for routing select box
            departments = await API.departments.getAll();

            const posts = await API.posts.getAll();
            
            // Populate Map
            posts.forEach(post => addMapMarker(post));

            // Populate Table
            reportsTbody.innerHTML = '';
            posts.forEach(post => {
                const tr = createTableElement(post);
                reportsTbody.appendChild(tr);
            });

            // Populate AI Routing logs widget
            aiLogsContainer.innerHTML = '';
            posts.forEach(post => {
                if (post.ai_analysis) {
                    const block = createAiLogBlock(post);
                    aiLogsContainer.appendChild(block);
                }
            });

        } catch (e) {
            console.error("Failed to load queue grids:", e);
        }
    }

    // Create row for Recent Claims table
    function createTableElement(post) {
        const tr = document.createElement('tr');
        tr.id = `table-row-${post.id}`;
        
        const badgeClass = getStatusBadgeClass(post.status);
        const deptId = post.department ? post.department.id : 0;
        
        // Build re-route select box options
        let selectOptions = `<option value="">Re-route...</option>`;
        departments.forEach(dept => {
            selectOptions += `<option value="${dept.id}" ${dept.id === deptId ? 'selected' : ''}>${dept.name}</option>`;
        });

        tr.innerHTML = `
            <td>
                <div style="font-weight:600;">${post.title}</div>
                <div style="font-size:0.7rem; opacity:0.6;">${post.location}</div>
            </td>
            <td>
                <select class="form-control routing-select" data-post-id="${post.id}" style="font-size:0.75rem; padding:0.25rem 0.5rem; width: auto; height: auto;">
                    ${selectOptions}
                </select>
            </td>
            <td><strong>${post.ai_analysis ? post.ai_analysis.confidence : 0}%</strong></td>
            <td><span style="font-weight:500; font-size:0.75rem; text-transform:uppercase;">${post.ai_analysis ? post.ai_analysis.urgency : 'LOW'}</span></td>
            <td><span class="badge ${badgeClass}" id="table-badge-${post.id}">${post.status.replace('_', ' ')}</span></td>
            <td>
                <a href="verification.html?id=${post.id}" class="btn btn-primary" style="padding:0.25rem 0.75rem; font-size:0.75rem; border-radius:4px;">
                    Review
                </a>
            </td>
        `;

        // Bind re-route select event handler
        const select = tr.querySelector('.routing-select');
        select.addEventListener('change', async (e) => {
            const newDeptId = parseInt(e.target.value);
            if (!newDeptId) return;
            try {
                await API.posts.reroute(post.id, newDeptId);
                showToast(`Post #${post.id} rerouted successfully.`, 'success');
                loadCharts(); // Update department workloads workload charts
            } catch(err) {
                showToast(`Failed to reroute post: ${err.message}`, 'error');
            }
        });

        return tr;
    }

    // Create log block for AI Routing Logs column
    function createAiLogBlock(post) {
        const el = document.createElement('div');
        el.className = 'card';
        el.id = `ai-log-block-${post.id}`;
        el.style.padding = '0.75rem';
        el.style.background = 'rgba(255,255,255,0.02)';
        el.style.borderLeft = `3px solid ${getStatusColor(post.status)}`;
        el.style.fontSize = '0.8rem';
        
        el.innerHTML = `
            <div style="display:flex; justify-content:between; font-weight:600; margin-bottom:0.2rem;">
                <span>Case #${post.id}: ${post.ai_analysis.topic}</span>
                <span style="color:var(--color-accent);">${post.ai_analysis.confidence}% Conf</span>
            </div>
            <div style="opacity:0.7; font-size:0.75rem; line-height:1.4;">
                Recommend Dept: <strong>${post.department ? post.department.name : 'Other'}</strong><br>
                Reason: ${post.ai_analysis.reason}
            </div>
        `;
        return el;
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

    // WebSockets Integration
    WS.on('NEW_POST', (data) => {
        const post = data.post;
        
        // Add marker to Leaflet
        addMapMarker(post);

        // Transform broadcast post compatibility
        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            location: post.location,
            latitude: post.latitude || 13.0827,
            longitude: post.longitude || 80.2707,
            status: post.status,
            created_at: post.created_at,
            user: post.user,
            department: post.department,
            ai_analysis: post.ai_analysis
        };

        // Prepend to table queue
        const tr = createTableElement(formattedPost);
        reportsTbody.prepend(tr);

        // Prepend to AI logs
        if (formattedPost.ai_analysis) {
            const block = createAiLogBlock(formattedPost);
            aiLogsContainer.prepend(block);
        }

        // Refresh stats
        loadStats();
        loadCharts();
        
        showToast(`Alert: Raw Claim #${post.id} Ingested. AI pre-analysis active.`);
    });

    WS.on('POST_VERIFIED', (data) => {
        // Update stats
        loadStats();
        loadCharts();

        // Update table row badge
        const badge = document.getElementById(`table-badge-${data.post_id}`);
        if (badge) {
            badge.textContent = data.status.replace('_', ' ');
            badge.className = `badge ${getStatusBadgeClass(data.status)}`;
        }

        // Update Leaflet marker color
        const marker = markers[data.post_id];
        if (marker) {
            marker.setStyle({
                fillColor: getStatusColor(data.status),
                radius: data.status === 'CRITICAL' ? 10 : 7
            });
        }
    });

    WS.on('POST_REROUTED', (data) => {
        // Update selection on table row
        const row = document.getElementById(`table-row-${data.post_id}`);
        if (row) {
            const select = row.querySelector('.routing-select');
            if (select) {
                select.value = data.department_id;
            }
        }
        
        // Update department text inside AI logs
        const logBlock = document.getElementById(`ai-log-block-${data.post_id}`);
        if (logBlock) {
            const label = logBlock.querySelector('strong');
            if (label) {
                label.textContent = data.department_name;
            }
        }
        
        loadCharts();
    });

    // Initalize Page
    initMap();
    loadStats();
    loadCharts();
    loadQueues();
});
