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
