// SENTINEL Verification Workspace Controller

document.addEventListener('DOMContentLoaded', () => {
    // Authenticate
    const user = API.auth.getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
        showToast('Access Denied: Officer credentials required.', 'error');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1000);
        return;
    }

    // Elements
    const caseSelect = document.getElementById('case-select-dropdown');
    const claimTitle = document.getElementById('claim-title');
    const claimMeta = document.getElementById('claim-meta');
    const claimBody = document.getElementById('claim-body');
    const claimImgContainer = document.getElementById('claim-image-container');
    const claimImg = document.getElementById('claim-image');
    const forensicStatus = document.getElementById('forensic-status-box');

    const aiTopic = document.getElementById('ai-topic');
    const aiUrgency = document.getElementById('ai-urgency');
    const aiConfidence = document.getElementById('ai-confidence');
    const aiDept = document.getElementById('ai-department');
    const aiLoc = document.getElementById('ai-location');
    const aiReason = document.getElementById('ai-reason');

    const officialText = document.getElementById('official-response-text');
    const btnPublish = document.getElementById('btn-publish-verdict');

    let currentPostId = null;

    // Load active cases to dropdown
    async function loadCasesDropdown(selectedId = null) {
        try {
            const posts = await API.posts.getAll();
            caseSelect.innerHTML = '<option value="">Load an active case...</option>';
            
            // We want to list all posts, with under_review first
            posts.sort((a,b) => {
                if (a.status === 'UNDER_REVIEW' && b.status !== 'UNDER_REVIEW') return -1;
                if (a.status !== 'UNDER_REVIEW' && b.status === 'UNDER_REVIEW') return 1;
                return b.id - a.id;
            });

            posts.forEach(post => {
                const opt = document.createElement('option');
                opt.value = post.id;
                const statusLabel = post.status === 'UNDER_REVIEW' ? '⏳ [Review]' : '✅ [Done]';
                opt.textContent = `${statusLabel} Case #${post.id} - ${post.title.substring(0, 30)}...`;
                if (selectedId && post.id === parseInt(selectedId)) {
                    opt.selected = true;
                }
                caseSelect.appendChild(opt);
            });

            // Auto-load case if selectedId matches
            if (selectedId) {
                loadCaseDetails(selectedId);
            } else if (posts.length > 0) {
                // Auto load first post if no query param
                caseSelect.value = posts[0].id;
                loadCaseDetails(posts[0].id);
            }
        } catch (e) {
            showToast('Failed to retrieve cases index list.', 'error');
        }
    }

    // Populate Workspace Columns with Post Details
    async function loadCaseDetails(postId) {
        currentPostId = parseInt(postId);
        try {
            const post = await API.posts.get(postId);

            // Left Col
            claimTitle.textContent = post.title;
            claimMeta.textContent = `Author: @${post.user.username} • Submitted: ${new Date(post.created_at).toLocaleString()} • Location: ${post.location}`;
            claimBody.textContent = post.content;

            if (post.media && post.media.length > 0) {
                claimImgContainer.style.display = 'block';
                claimImg.src = post.media[0].file_path;
                forensicStatus.innerHTML = `Forensic Analysis Stage: <strong style="color:var(--color-accent);">${post.media[0].analysis_stage}</strong>`;
            } else {
                claimImgContainer.style.display = 'none';
            }

            // Center Col
            if (post.ai_analysis) {
                aiTopic.textContent = post.ai_analysis.topic;
                aiUrgency.textContent = post.ai_analysis.urgency;
                aiConfidence.textContent = `${post.ai_analysis.confidence}%`;
                aiDept.textContent = post.department ? post.department.name : 'Other Departments';
                aiLoc.textContent = post.ai_analysis.location || post.location;
                aiReason.textContent = post.ai_analysis.reason;
            } else {
                aiTopic.textContent = post.category;
                aiUrgency.textContent = 'LOW';
                aiConfidence.textContent = '50%';
                aiDept.textContent = post.department ? post.department.name : 'Other';
                aiLoc.textContent = post.location;
                aiReason.textContent = 'No LLM pre-analysis records available.';
            }

            // Right Col
            // Reset verdict checks
            const radio = document.querySelector(`input[name="verdict"][value="${post.status}"]`);
            if (radio) {
                radio.checked = true;
            } else {
                // Default to verified if status not in list
                document.querySelector('input[name="verdict"][value="VERIFIED"]').checked = true;
            }

            officialText.value = post.verification ? post.verification.official_response : '';

        } catch (e) {
            showToast(`Failed to load case #${postId} details: ${e.message}`, 'error');
        }
    }

    // Dropdown change listener
    caseSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            loadCaseDetails(val);
            // Update URL query string without reloading page
            const newUrl = `${window.location.pathname}?id=${val}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    });

    // Publish Verdict
    btnPublish.addEventListener('click', async () => {
        if (!currentPostId) {
            showToast('No active case loaded to verify.', 'error');
            return;
        }

        const verdictRadio = document.querySelector('input[name="verdict"]:checked');
        const verdict = verdictRadio ? verdictRadio.value : 'VERIFIED';
        const responseText = officialText.value.trim();

        if (!responseText) {
            showToast('Please compose an official clarification response.', 'error');
            return;
        }

        try {
            await API.verification.submit(currentPostId, verdict, responseText);
            showToast(`Verification submitted and published for Case #${currentPostId}`, 'success');
            
            // Reload dropdown to update tags
            loadCasesDropdown(currentPostId);
        } catch (err) {
            showToast(`Submit failed: ${err.message}`, 'error');
        }
    });

    // Read initial Query param
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');

    loadCasesDropdown(urlId);

    // WebSocket forensic tag updates
    WS.on('IMAGE_ANALYSIS_PROGRESS', (data) => {
        if (currentPostId && data.post_id === currentPostId) {
            forensicStatus.innerHTML = `Forensic Analysis Stage: <strong style="color:var(--color-success);">${data.stage}</strong> - ${data.message}`;
        }
    });
});
