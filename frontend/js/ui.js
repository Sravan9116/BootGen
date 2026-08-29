// SENTINEL UI Shared Controls

// Create global toast function
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in-up`;
    
    // Choose icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
    // 0. Replace navigation emojis with high-quality SVG vector icons
    const svgMap = {
        "World Feed": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M16 8h2"></path><path d="M16 12h2"></path><path d="M16 16h2"></path><path d="M6 8h6v8H6z"></path></svg>`,
        "World Chat": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        "My Dashboard": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
        "Report Incident": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>`,
        "Fact Checker": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
        "Control Room": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="10" y1="6" x2="10.01" y2="6"></line><line x1="14" y1="18" x2="14.01" y2="18"></line><line x1="18" y1="18" x2="18.01" y2="18"></line></svg>`,
        "Verification Room": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="m11 8 3 3-3 3"></path></svg>`,
        "Department Board": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 10h6"></path><path d="M9 18h6"></path></svg>`,
        "Alert Dispatch": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M2 2h20"></path></svg>`,
        "Emergency Map": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>`,
        "Logout": `<svg class="nav-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        const id = item.getAttribute('id');
        let iconSvg = '';
        
        if (href) {
            if (href.includes('world-feed.html')) iconSvg = svgMap["World Feed"];
            else if (href.includes('world-chat.html')) iconSvg = svgMap["World Chat"];
            else if (href.includes('dashboard.html')) iconSvg = svgMap["My Dashboard"];
            else if (href.includes('report.html')) iconSvg = svgMap["Report Incident"];
            else if (href.includes('fact-check.html')) iconSvg = svgMap["Fact Checker"];
            else if (href.includes('admin.html')) iconSvg = svgMap["Control Room"];
            else if (href.includes('verification.html')) iconSvg = svgMap["Verification Room"];
            else if (href.includes('department.html')) iconSvg = svgMap["Department Board"];
            else if (href.includes('alerts.html')) iconSvg = svgMap["Alert Dispatch"];
            else if (href.includes('emergency.html')) iconSvg = svgMap["Emergency Map"];
        }
        
        if (id === 'btn-logout' || item.classList.contains('logout-btn') || (href && href === '#')) {
            iconSvg = svgMap["Logout"];
        }
        
        if (iconSvg) {
            let text = item.textContent.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
            item.innerHTML = iconSvg + ' ' + text;
        }
    });

    // 1. Initialize mobile sidebar drawer toggling
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
        
        // Close sidebar if user clicks outside of it on mobile
        document.addEventListener('click', (event) => {
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(event.target) && 
                !menuBtn.contains(event.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }

    // 2. Load current user details in the header/profile section
    const currentUser = API.auth.getCurrentUser();
    const userRoleEl = document.getElementById('header-user-role');
    const usernameEl = document.getElementById('header-username');
    
    if (usernameEl && currentUser) {
        usernameEl.textContent = `@${currentUser.username}`;
    }
    if (userRoleEl && currentUser) {
        userRoleEl.textContent = currentUser.role === 'ADMIN' ? 'Admin Coordinator' : 
                               currentUser.role === 'STAFF' ? 'Dept Officer' : 'Citizen';
    }

    // 3. Simple log-out triggers
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            API.auth.logout();
        });
    }

    // 4. Apply i18n translations
    if (window.applyTranslations && window.currentLang) {
        window.applyTranslations(window.currentLang);
    }
});

// Render general loading skeleton
function renderSkeleton(container, count = 3) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'card animate-shimmer';
        skeleton.style.height = '120px';
        skeleton.style.marginBottom = '1rem';
        skeleton.style.borderRadius = 'var(--border-radius-lg)';
        container.appendChild(skeleton);
    }
}

window.renderSkeleton = renderSkeleton;
