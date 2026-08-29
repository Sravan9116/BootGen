// SENTINEL Department Kanban Queue Controller

document.addEventListener('DOMContentLoaded', async () => {
    const user = API.auth.getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
        showToast('Access Denied: Officer authorization required.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    // Elements
    const deptLabel = document.getElementById('current-dept-label');
    const dropdownContainer = document.getElementById('dept-dropdown-container');
    const deptSelect = document.getElementById('kanban-dept-select');
    
    let activeDeptId = null;
    let departments = [];

    // Check credentials and role permissions
    if (user.role === 'STAFF') {
        activeDeptId = user.department_id;
        dropdownContainer.style.display = 'none';
    } else {
        // Admin can toggle departments
        dropdownContainer.style.display = 'block';
    }

    // Load departments mapping list
    async function initDepartments() {
        try {
            departments = await API.departments.getAll();
            
            if (user.role === 'ADMIN') {
                deptSelect.innerHTML = '';
                departments.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = d.name;
                    deptSelect.appendChild(opt);
                });
                
                // Default selection
                activeDeptId = departments[0].id;
                deptLabel.textContent = departments[0].name;
            } else {
                const myDept = departments.find(d => d.id === activeDeptId);
                deptLabel.textContent = myDept ? myDept.name : 'Unknown Agency';
            }

            // Load columns cards
            loadKanbanData();
        } catch(e) {
            showToast('Failed to initialize department names.', 'error');
        }
    }

    // Admin selection change listener
    deptSelect.addEventListener('change', (e) => {
        const id = parseInt(e.target.value);
        if (id) {
            activeDeptId = id;
            const myDept = departments.find(d => d.id === id);
            deptLabel.textContent = myDept ? myDept.name : 'Unknown Agency';
            loadKanbanData();
        }
    });

    // Populate Kanban Swimlanes
    async function loadKanbanData() {
        if (!activeDeptId) return;

        // Clear columns
        const lanes = ['NEW', 'AI', 'REVIEW', 'VERIFIED', 'PUBLISHED'];
        lanes.forEach(lane => {
            document.getElementById(`lane-${lane}`).innerHTML = '';
            document.getElementById(`count-${lane}`).textContent = '(0)';
        });

        try {
            const posts = await API.posts.getAll({ department_id: activeDeptId });
            
            // Track item counts per lane
            const counts = { NEW: 0, AI: 0, REVIEW: 0, VERIFIED: 0, PUBLISHED: 0 };

            posts.forEach(post => {
                let lane = 'NEW';
                
                // Determine lane mapping based on validation workflow status
                if (post.status === 'UNDER_REVIEW') {
                    if (post.ai_analysis && post.ai_analysis.confidence >= 80) {
                        lane = 'AI';
                    } else {
                        lane = 'NEW';
                    }
                    
                    // Simple local storage mock tracking to simulate moving to IN PROGRESS / UNDER REVIEW
                    if (localStorage.getItem(`sentinel_review_${post.id}`) === 'true') {
                        lane = 'REVIEW';
                    }
                } else {
                    // Post status is VERIFIED, PARTIALLY_CORRECT, FALSE, or CRITICAL
                    if (post.verification && post.verification.official_response) {
                        lane = 'PUBLISHED';
                    } else {
                        lane = 'VERIFIED';
                    }
                }

                counts[lane]++;
                const card = createKanbanCard(post, lane);
                document.getElementById(`lane-${lane}`).appendChild(card);
            });

            // Update column badges
            lanes.forEach(lane => {
                document.getElementById(`count-${lane}`).textContent = `(${counts[lane]})`;
            });

        } catch (e) {
            showToast('Failed to load Kanban workspace data.', 'error');
        }
    }

    // Create a Kanban card
    function createKanbanCard(post, currentLane) {
        const el = document.createElement('div');
        el.className = 'kanban-card animate-msg-appear';
        el.id = `kanban-post-${post.id}`;

        let actionButton = '';
        if (currentLane === 'NEW' || currentLane === 'AI') {
            actionButton = `<button class="btn btn-secondary" style="font-size:0.7rem; padding:0.25rem 0.5rem;" onclick="startCaseReview(${post.id})">⚙️ Review</button>`;
        } else if (currentLane === 'REVIEW') {
            actionButton = `<a href="verification.html?id=${post.id}" class="btn btn-primary" style="font-size:0.7rem; padding:0.25rem 0.5rem;">⚖️ Verify</a>`;
        } else if (currentLane === 'VERIFIED') {
            actionButton = `<a href="verification.html?id=${post.id}" class="btn btn-primary" style="font-size:0.7rem; padding:0.25rem 0.5rem; background-color:var(--color-success);">🌍 Publish</a>`;
        }

        const dateStr = new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        el.innerHTML = `
            <div class="kanban-card-title">${post.title}</div>
            <div class="kanban-card-meta">
                Case #${post.id} • ${dateStr} • ${post.location}
            </div>
            <p style="font-size:0.8rem; line-height:1.4; opacity:0.8; max-height: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                "${post.content}"
            </p>
            <div class="kanban-card-actions">
                ${actionButton}
            </div>
        `;
        return el;
    }

    // Move to IN PROGRESS reviewer
    window.startCaseReview = function(postId) {
        localStorage.setItem(`sentinel_review_${postId}`, 'true');
        showToast(`Case #${postId} moved to Review Queue.`, 'info');
        loadKanbanData();
    };

    // WebSocket events
    WS.on('NEW_POST', (data) => {
        if (activeDeptId && data.post.department.name === deptLabel.textContent) {
            loadKanbanData();
            showToast(`New case routed to your department: #${data.post.id}`);
        }
    });

    WS.on('POST_VERIFIED', (data) => {
        loadKanbanData();
    });

    WS.on('POST_REROUTED', (data) => {
        // If post was rerouted to/from active department queue
        loadKanbanData();
    });

    // Initalize
    initDepartments();
});
