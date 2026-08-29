// SENTINEL Incident Report Controller

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit-report');
    const formContainer = document.getElementById('form-container');
    const trackerContainer = document.getElementById('tracker-container');
    const trackerSummaryCard = document.getElementById('tracker-summary-card');
    const trackerAiText = document.getElementById('tracker-ai-text');

    // Form inputs
    const reportTitle = document.getElementById('report-title');
    const reportDesc = document.getElementById('report-description');
    const reportCat = document.getElementById('report-category');
    const reportLoc = document.getElementById('report-location');
    const reportSev = document.getElementById('report-severity');
    const reportImg = document.getElementById('report-image');

    let createdPostId = null;

    btnSubmit.addEventListener('click', async () => {
        const title = reportTitle.value.trim();
        const desc = reportDesc.value.trim();
        const category = reportCat.value;
        const location = reportLoc.value.trim();
        const severity = reportSev.value;
        const mockImg = reportImg.value;

        if (!title || !desc) {
            showToast('Please provide a title and incident description', 'error');
            return;
        }

        // Display tracker
        trackerContainer.style.display = 'block';
        resetTimeline();

        try {
            // Step 1: Ingested
            setTimelineStage(1, 'active', 'Report uploaded to SQLite DB.');
            await delay(800);
            setTimelineStage(1, 'completed', 'Ingested at ' + new Date().toLocaleTimeString());

            // Step 2: AI Pre-Analysis starts
            setTimelineStage(2, 'active', 'Triggering Qwen3 evaluation...');
            await delay(800);

            // API Call to create post
            const postPayload = {
                title: title,
                content: desc,
                category: category,
                location: location || 'Unknown Location',
                image_url: mockImg || null,
                severity: severity
            };
            
            // Trigger REST call
            const result = await API.posts.create(postPayload);
            createdPostId = result.id;

            setTimelineStage(2, 'completed', `Topic: ${result.ai_analysis.topic} (Confidence: ${result.ai_analysis.confidence}%)`);

            // Step 3: Department assigned
            setTimelineStage(3, 'active', 'Evaluating department tags...');
            await delay(800);
            
            const deptName = result.department ? result.department.name : 'Other Departments';
            setTimelineStage(3, 'completed', `Assigned to: ${deptName}`);

            // Populate summary card
            trackerSummaryCard.style.display = 'block';
            trackerAiText.innerHTML = `
                <strong>Topic:</strong> ${result.ai_analysis.topic}<br>
                <strong>Recommended Dept:</strong> ${deptName}<br>
                <strong>Urgency Rank:</strong> ${result.ai_analysis.urgency}<br>
                <strong>AI Summary:</strong> ${result.ai_analysis.summary}
            `;

            // Step 4: Under review status
            setTimelineStage(4, 'active', 'Awaiting government official confirmation...');
            
        } catch (e) {
            showToast(`Report ingestion failed: ${e.message}`, 'error');
            setTimelineStage(2, 'active', `Offline analysis error: ${e.message}`);
        }
    });

    function resetTimeline() {
        createdPostId = null;
        trackerSummaryCard.style.display = 'none';
        for (let i = 1; i <= 5; i++) {
            const el = document.getElementById(`track-stage-${i}`);
            el.className = 'timeline-item';
            document.getElementById(`time-stage-${i}`).textContent = 'Waiting...';
        }
    }

    function setTimelineStage(num, state, message) {
        const item = document.getElementById(`track-stage-${num}`);
        const text = document.getElementById(`time-stage-${num}`);
        
        if (state === 'active') {
            item.className = 'timeline-item active';
        } else if (state === 'completed') {
            item.className = 'timeline-item completed';
        } else {
            item.className = 'timeline-item';
        }
        
        text.textContent = message;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // WebSocket trigger to auto-update timeline stage 5 when verified
    WS.on('POST_VERIFIED', (data) => {
        if (createdPostId && data.post_id === createdPostId) {
            // Stage 4 completed
            setTimelineStage(4, 'completed', `Verified as: ${data.status.replace('_', ' ')}`);
            // Stage 5 active and completed
            setTimelineStage(5, 'completed', `Clarification: "${data.official_response}"`);
            showToast('Official response has been published for your report!', 'success');
        }
    });
});
