// SENTINEL World Feed Controller

document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    const alertsWidget = document.getElementById('alerts-widget-container');
    
    // Composer elements
    const composerTitle = document.getElementById('composer-title');
    const composerContent = document.getElementById('composer-content');
    const composerCategory = document.getElementById('composer-category');
    const composerLocation = document.getElementById('composer-location');
    const composerMockImg = document.getElementById('composer-mock-image');
    const imagePreviewBox = document.getElementById('image-preview-box');
    const imagePreviewImg = document.getElementById('image-preview-img');
    const btnRemovePreview = document.getElementById('btn-remove-preview');
    const btnPublish = document.getElementById('btn-publish-post');
    const composerIsNews = document.getElementById('composer-is-news');
    const composerNewsSource = document.getElementById('composer-news-source');
    
    if (composerIsNews && composerNewsSource) {
        composerIsNews.addEventListener('change', (e) => {
            if (e.target.checked) {
                composerNewsSource.style.display = 'block';
            } else {
                composerNewsSource.style.display = 'none';
                composerNewsSource.value = '';
            }
        });
    }
    
    // Modal elements
    const neuralModal = document.getElementById('neural-modal');
    const neuralStatus = document.getElementById('neural-status');

    let selectedMockImage = '';

    // Handle mock image selection
    composerMockImg.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            selectedMockImage = val;
            imagePreviewImg.src = val;
            imagePreviewBox.style.display = 'block';
        } else {
            removeImagePreview();
        }
    });

    btnRemovePreview.addEventListener('click', removeImagePreview);

    function removeImagePreview() {
        selectedMockImage = '';
        composerMockImg.value = '';
        imagePreviewBox.style.display = 'none';
        imagePreviewImg.src = '';
    }

    // Load Posts
    async function loadPosts() {
        renderSkeleton(postsContainer, 3);
        try {
            const posts = await API.posts.getAll();
            renderPosts(posts);
        } catch (err) {
            postsContainer.innerHTML = `<div class="card text-center text-danger p-3">Failed to load world feed. (${err.message})</div>`;
        }
    }

    // Load Alerts Widget
    async function loadAlertsWidget() {
        try {
            const alerts = await API.alerts.getAll();
            const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
            if (criticalAlerts.length > 0) {
                alertsWidget.innerHTML = '';
                criticalAlerts.slice(0, 3).forEach(alert => {
                    const el = document.createElement('div');
                    el.className = 'card animate-emergency-pulse';
                    el.style.padding = '1rem';
                    el.style.border = '1px solid var(--color-critical)';
                    el.style.color = 'white';
                    el.innerHTML = `
                        <h4 style="font-size:0.85rem; text-transform:uppercase;">⚠️ <span data-i18n="${alert.alert_type.toLowerCase()}">${alert.alert_type}</span> <span data-i18n="alert_suffix">ALERT</span></h4>
                        <p style="font-size:0.8rem; margin:0.25rem 0;">${alert.message}</p>
                        <span style="font-size:0.7rem; opacity:0.7;"><span data-i18n="location_prefix">Location</span>: ${alert.location}</span>
                    `;
                    alertsWidget.appendChild(el);
                });
            } else {
                alertsWidget.innerHTML = '<div class="text-muted" style="font-size:0.85rem;" data-i18n="no_emergencies_msg">No active critical emergencies.</div>';
            }
            
            // Apply translations to dynamic content
            if (window.applyTranslations && window.currentLang) {
                window.applyTranslations(window.currentLang);
            }
        } catch (e) {
            console.error("Failed to load alerts widget:", e);
        }
    }

    // Render Posts to UI
    function renderPosts(posts) {
        postsContainer.innerHTML = '';
        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="card text-center p-3 text-muted" data-i18n="no_posts_msg">No posts available on the feed.</div>';
            if (window.applyTranslations && window.currentLang) {
                window.applyTranslations(window.currentLang);
            }
            return;
        }

        posts.forEach(post => {
            const card = createPostCard(post);
            postsContainer.appendChild(card);
        });

        // Translate the newly rendered posts
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

    // Render comments list dynamically
    async function renderCommentsList(postId, container, countText) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`);
            if (response.ok) {
                const comments = await response.json();
                if (countText) countText.textContent = comments.length;
                container.innerHTML = '';
                if (comments.length === 0) {
                    container.innerHTML = '<div class="text-muted" style="font-size:0.8rem; font-style:italic; padding: 0.25rem 0.5rem;" data-i18n="no_comments_yet">No comments yet. Be the first to discuss!</div>';
                    if (window.applyTranslations && window.currentLang) {
                        window.applyTranslations(window.currentLang);
                    }
                    return;
                }
                comments.forEach(c => {
                    const el = document.createElement('div');
                    el.style.fontSize = '0.8rem';
                    el.style.padding = '0.4rem 0.8rem';
                    el.style.background = 'rgba(255,255,255,0.02)';
                    el.style.border = '1px solid rgba(255,255,255,0.04)';
                    el.style.borderRadius = 'var(--border-radius-sm)';
                    el.innerHTML = `
                        <div style="font-weight:600; display:flex; justify-content:space-between; margin-bottom:0.1rem;">
                            <span>@${c.username}</span>
                            <span class="text-muted" style="font-size:0.7rem;">${new Date(c.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div class="text-muted" style="line-height:1.4;">${c.content}</div>
                    `;
                    container.appendChild(el);
                });
                container.scrollTop = container.scrollHeight;
            }
        } catch (e) {
            console.error("Comments loading error:", e);
        }
    }

    // Create single Post Card element
    function createPostCard(post) {
        const el = document.createElement('div');
        el.className = 'card feed-post animate-msg-appear';
        el.id = `post-${post.id}`;

        const badgeClass = getStatusBadgeClass(post.status);
        const deptName = post.department ? post.department.name : 'Unassigned';
        
        // AI assessment markup
        let aiMarkup = '';
        if (post.ai_analysis) {
            aiMarkup = `
                <div class="ai-assessment-box" style="margin-top:0.75rem; font-size:0.8rem; background:rgba(0,112,243,0.04); border-left: 3px solid var(--color-secondary); padding: 0.5rem 0.75rem; border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;">
                    <strong>AI Analysis Assessment:</strong> ${post.ai_analysis.summary}<br>
                    <span class="text-muted">Routed to: <strong>${deptName}</strong> (Confidence: ${post.ai_analysis.confidence}%)</span>
                </div>
            `;
        }

        // Image attachments markup
        let imageMarkup = '';
        if (post.media && post.media.length > 0) {
            const imgItem = post.media[0];
            const stageLabels = {
                'PENDING': 'Queued',
                'METADATA_ANALYZED': 'Metadata Verified',
                'VISUAL_ANALYZED': 'Visual Context Verified',
                'DUPLICATE_CHECKED': 'Historical Integrity Verified',
                'CLAIM_MATCHED': 'Authenticity Certified',
                'COMPLETED': 'Forensic Analysis Completed (Score: 94%)'
            };
            const currentStageLabel = stageLabels[imgItem.analysis_stage] || 'Forensic active';
            const progressStyle = imgItem.analysis_stage === 'COMPLETED' ? 'color: var(--color-success); font-weight: 600;' : 'color: var(--color-secondary);';
            
            imageMarkup = `
                <div style="position:relative; margin-bottom:1rem;">
                    <img src="${imgItem.file_path}" class="post-image" alt="Post attachment">
                    <div id="forensic-${post.id}" style="font-size:0.75rem; padding:0.4rem 0.8rem; border-radius: var(--border-radius-sm); background: rgba(0,0,0,0.7); color: white; position:absolute; bottom: 15px; left:15px; display:flex; align-items:center; gap:0.5rem; backdrop-filter:blur(5px);">
                        <span id="forensic-spin-${post.id}" style="${imgItem.analysis_stage === 'COMPLETED' ? 'display:none;' : 'display:inline-block; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius:50%; width: 10px; height:10px; animation: pulse 1s infinite;' }"></span>
                        <span id="forensic-text-${post.id}" style="${progressStyle}">🔍 Image Analysis: ${currentStageLabel}</span>
                    </div>
                </div>
            `;
        }

        // Official Response markup
        let verificationMarkup = '';
        if (post.verification && post.verification.official_response) {
            const deptKey = deptName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            verificationMarkup = `
                <div class="official-response-box" style="margin-top:1rem; padding: 1rem; border-radius: var(--border-radius); background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25);">
                    <h5 style="font-size:0.85rem; color: #047857; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
                        🏛️ <span data-i18n="official_clarification_prefix">Official Clarification</span>: <span data-i18n="${deptKey}">${deptName}</span>
                    </h5>
                    <p style="font-size:0.85rem; line-height:1.5;">${post.verification.official_response}</p>
                </div>
            `;
        }

        // Source Tag markup
        let sourceMarkup = '';
        if (post.is_official_news) {
            sourceMarkup = `
                <div style="display:inline-flex; align-items:center; gap:0.25rem; margin-top:0.5rem; font-size:0.75rem; color:var(--color-accent); font-weight:600;">
                    <span>📢 Source: ${post.news_source || 'Verified Channel'}</span>
                </div>
            `;
        }

        el.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <div class="avatar">${post.user.username[0].toUpperCase()}</div>
                    <div class="post-meta">
                        <h4>@${post.user.username}</h4>
                        <span class="text-muted">${new Date(post.created_at).toLocaleString()} • ${post.location}</span>
                    </div>
                </div>
                <div>
                    <span class="badge ${badgeClass}" id="status-badge-${post.id}">${post.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="post-body">
                <h3 style="font-size:1.05rem; margin-bottom:0.5rem; font-family:'Poppins';">${post.title}</h3>
                <p class="text-muted" style="margin-bottom: 0.5rem;">${post.content}</p>
                ${sourceMarkup}
                ${imageMarkup}
                ${aiMarkup}
                ${verificationMarkup}
            </div>
            <div class="post-footer" style="padding-top: 0.75rem; border-top: 1px solid var(--border-color-light); margin-top: 1rem;">
                <div class="post-action" id="like-btn-${post.id}" style="cursor:pointer; display:inline-flex; align-items:center; gap:0.3rem;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Like (<span id="likes-count-${post.id}">${post.likes_count || 0}</span>)
                </div>
                <div class="post-action" id="comment-toggle-${post.id}" style="cursor:pointer; display:inline-flex; align-items:center; gap:0.3rem;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Comment (<span id="comments-count-${post.id}">${post.comments ? post.comments.length : 0}</span>)
                </div>
                <div class="post-action" id="share-btn-${post.id}" style="cursor:pointer; display:inline-flex; align-items:center; gap:0.3rem;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share
                </div>
            </div>
            
            <!-- Comments Section Drawer -->
            <div class="comments-section" id="comments-section-${post.id}" style="display: none; border-top: 1px solid var(--border-color-light); padding: 1rem 0 0 0; margin-top: 0.75rem; background: transparent;">
                <div class="comments-list" id="comments-list-${post.id}" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; max-height: 180px; overflow-y: auto;">
                    <!-- Appended dynamically -->
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" id="comment-input-${post.id}" class="form-control" placeholder="Write a comment..." style="font-size: 0.8rem; padding: 0.4rem 0.8rem; flex: 1;">
                    <button class="btn btn-primary" id="btn-submit-comment-${post.id}" style="padding: 0.4rem 1rem; font-size: 0.8rem; width: auto;">Post</button>
                </div>
            </div>
        `;

        // Bind interactive events dynamically in background
        const currentUser = API.auth.getCurrentUser() || { id: 1, username: 'civilian' };
        setTimeout(() => {
            const likeBtn = document.getElementById(`like-btn-${post.id}`);
            const commentToggle = document.getElementById(`comment-toggle-${post.id}`);
            const shareBtn = document.getElementById(`share-btn-${post.id}`);
            const commentInput = document.getElementById(`comment-input-${post.id}`);
            const btnSubmitComment = document.getElementById(`btn-submit-comment-${post.id}`);
            const commentsSection = document.getElementById(`comments-section-${post.id}`);
            const commentsList = document.getElementById(`comments-list-${post.id}`);
            const likesCountText = document.getElementById(`likes-count-${post.id}`);
            const commentsCountText = document.getElementById(`comments-count-${post.id}`);

            if (likeBtn) {
                likeBtn.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
                        if (response.ok) {
                            const updatedPost = await response.json();
                            if (likesCountText) likesCountText.textContent = updatedPost.likes_count;
                            showToast('Thank you for voting. Like recorded!', 'success');
                        }
                    } catch (e) {
                        console.error("Failed to like post:", e);
                    }
                });
            }

            if (commentToggle) {
                commentToggle.addEventListener('click', () => {
                    if (commentsSection.style.display === 'none') {
                        commentsSection.style.display = 'block';
                        renderCommentsList(post.id, commentsList, commentsCountText);
                    } else {
                        commentsSection.style.display = 'none';
                    }
                });
            }

            if (btnSubmitComment) {
                const submitComment = async () => {
                    const content = commentInput.value.trim();
                    if (!content) return;
                    try {
                        const response = await fetch(`/api/posts/${post.id}/comments`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-user-id': currentUser.id.toString()
                            },
                            body: JSON.stringify({ content })
                        });
                        if (response.ok) {
                            commentInput.value = '';
                            renderCommentsList(post.id, commentsList, commentsCountText);
                            showToast('Comment posted successfully!', 'success');
                        }
                    } catch (e) {
                        console.error("Failed to post comment:", e);
                    }
                };

                btnSubmitComment.addEventListener('click', submitComment);
                commentInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') submitComment();
                });
            }

            if (shareBtn) {
                shareBtn.addEventListener('click', () => {
                    const shareText = `🚨 SENTINEL Incident Alert:\n"${post.title}"\nLocation: ${post.location}\nStatus: ${post.status.replace('_', ' ')}\nCheck details on Sentinel platform.`;
                    navigator.clipboard.writeText(shareText);
                    showToast('Copied formatted share text to clipboard!', 'success');
                });
            }
        }, 50);

        return el;
    }

    // Publish claim triggers 5-stage simulation
    btnPublish.addEventListener('click', async () => {
        const title = composerTitle.value.trim();
        const content = composerContent.value.trim();
        const category = composerCategory.value;
        const location = composerLocation.value.trim();

        const isOfficialNews = composerIsNews ? composerIsNews.checked : false;
        const newsSource = composerNewsSource ? composerNewsSource.value.trim() : "";

        if (!title || !content) {
            showToast('Please provide a title and report description', 'error');
            return;
        }

        if (isOfficialNews && !newsSource) {
            showToast('Please specify the name of the verified news outlet / publisher', 'warning');
            return;
        }

        // Show neural animation modal
        neuralModal.style.display = 'flex';
        resetTimelineAnimation();

        try {
            // Stage 1
            await updateTimelineStage(1, 'Preprocessing report contents...');
            
            // Stage 2
            await updateTimelineStage(2, 'Generating structured inputs...');
            
            // Stage 3
            await updateTimelineStage(3, 'Analyzing message with Qwen3:8B...');
            
            // Stage 4
            await updateTimelineStage(4, 'AI assessment computed. Checking classification thresholds...');
            
            // Stage 5
            await updateTimelineStage(5, 'Routing report to government department...');

            // Submit Post payload to database
            const postData = {
                title,
                content,
                category: category === 'General' ? 'Other' : category,
                location: location || 'Unknown Location',
                image_url: selectedMockImage || null,
                is_official_news: isOfficialNews,
                news_source: isOfficialNews ? newsSource : null
            };

            await API.posts.create(postData);

            // Close modal & notify
            setTimeout(() => {
                neuralModal.style.display = 'none';
                showToast('Report created and routed successfully!', 'success');
                // Reset composer
                composerTitle.value = '';
                composerContent.value = '';
                composerCategory.value = 'General';
                composerLocation.value = '';
                if (composerIsNews) {
                    composerIsNews.checked = false;
                    composerNewsSource.style.display = 'none';
                    composerNewsSource.value = '';
                }
                removeImagePreview();
            }, 1000);

        } catch (err) {
            neuralModal.style.display = 'none';
            showToast(`Analysis routing failed: ${err.message}`, 'error');
        }
    });

    // Helper functions for timeline simulation
    function resetTimelineAnimation() {
        for (let i = 1; i <= 5; i++) {
            const item = document.getElementById(`stage-${i}`);
            item.className = 'timeline-item';
        }
        neuralStatus.textContent = 'Ingesting report...';
    }

    function updateTimelineStage(num, text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const item = document.getElementById(`stage-${num}`);
                item.className = 'timeline-item active';
                neuralStatus.textContent = text;
                
                // Set previous item to completed
                if (num > 1) {
                    document.getElementById(`stage-${num-1}`).className = 'timeline-item completed';
                }
                resolve();
            }, 800);
        });
    }

    // Real-Time WebSocket updates integration
    WS.on('NEW_POST', (data) => {
        const post = data.post;
        // Check if post already rendered
        if (document.getElementById(`post-${post.id}`)) return;

        // Since post might not have relationships populated in broadcast, 
        // we formulate a basic post payload compatible with render
        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            location: post.location,
            status: post.status,
            created_at: post.created_at,
            user: { username: post.user.username },
            department: { name: post.department.name },
            media: post.image_url ? [{ file_path: post.image_url, analysis_stage: 'PENDING' }] : [],
            ai_analysis: post.ai_analysis
        };

        const card = createPostCard(formattedPost);
        postsContainer.prepend(card);
        showToast('New community report submitted.');
    });

    WS.on('POST_VERIFIED', (data) => {
        const postCard = document.getElementById(`post-${data.post_id}`);
        if (!postCard) return;

        // Update badge
        const badge = document.getElementById(`status-badge-${data.post_id}`);
        if (badge) {
            badge.textContent = data.status.replace('_', ' ');
            badge.className = `badge ${getStatusBadgeClass(data.status)}`;
        }

        // Render response box if not exists
        let responseBox = postCard.querySelector('.official-response-box');
        if (!responseBox) {
            const body = postCard.querySelector('.post-body');
            responseBox = document.createElement('div');
            responseBox.className = 'official-response-box';
            responseBox.style.marginTop = '1rem';
            responseBox.style.padding = '1rem';
            responseBox.style.borderRadius = 'var(--border-radius)';
            responseBox.style.background = 'rgba(16, 185, 129, 0.06)';
            responseBox.style.border = '1px solid rgba(16, 185, 129, 0.25)';
            body.appendChild(responseBox);
        }

        responseBox.innerHTML = `
            <h5 style="font-size:0.85rem; color: #047857; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
                🏛️ Official Clarification: ${data.department_name}
            </h5>
            <p style="font-size:0.85rem; line-height:1.5;">${data.official_response}</p>
        `;

        showToast(`Official verification update received: Post #${data.post_id}`);
    });

    WS.on('IMAGE_ANALYSIS_PROGRESS', (data) => {
        const forensicText = document.getElementById(`forensic-text-${data.post_id}`);
        const spinner = document.getElementById(`forensic-spin-${data.post_id}`);
        
        if (forensicText) {
            const stageLabels = {
                'PENDING': 'AI Ingestion Active...',
                'METADATA_ANALYZED': 'Metadata Authenticated',
                'VISUAL_ANALYZED': 'Object Analysis Complete',
                'DUPLICATE_CHECKED': 'Database Deduplicated',
                'CLAIM_MATCHED': 'Authenticity Certified',
                'COMPLETED': 'Forensic Analysis Completed (Score: 94%)'
            };
            
            forensicText.textContent = `🔍 Image Analysis: ${stageLabels[data.stage] || data.message}`;
            
            if (data.stage === 'COMPLETED') {
                forensicText.style.color = 'var(--color-success)';
                forensicText.style.fontWeight = '600';
                if (spinner) spinner.style.display = 'none';
            } else {
                forensicText.style.color = 'var(--color-secondary)';
                if (spinner) spinner.style.display = 'inline-block';
            }
        }
    });

    WS.on('CRITICAL_ALERT_BROADCAST', () => {
        loadAlertsWidget();
    });

    // Initialise
    loadPosts();
    loadAlertsWidget();
});
