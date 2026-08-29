// SENTINEL Centralised API Service Client

const BASE_URL = window.location.origin;

// Helper to get headers with X-User-ID context if logged in
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const userId = localStorage.getItem('sentinel_user_id');
    if (userId) {
        headers['X-User-ID'] = userId;
    }
    return headers;
}

// Fetch wrapper for robust error handling
async function request(url, options = {}) {
    options.headers = { ...getHeaders(), ...options.headers };
    
    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({ detail: 'Network request error' }));
            throw new Error(errData.detail || 'Network request error');
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error on ${url}:`, error);
        throw error;
    }
}

const API = {
    // Auth Service
    auth: {
        async login(email, password) {
            const user = await request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem('sentinel_user_id', user.id);
            localStorage.setItem('sentinel_username', user.username);
            localStorage.setItem('sentinel_role', user.role);
            localStorage.setItem('sentinel_dept_id', user.department_id || '');
            return user;
        },
        async register(username, email, password, role = 'USER', departmentId = null) {
            return await request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password, role, department_id: departmentId })
            });
        },
        logout() {
            localStorage.clear();
            window.location.href = '/pages/login.html';
        },
        getCurrentUser() {
            const id = localStorage.getItem('sentinel_user_id');
            const username = localStorage.getItem('sentinel_username');
            const role = localStorage.getItem('sentinel_role');
            const deptId = localStorage.getItem('sentinel_dept_id');
            return id ? { id: parseInt(id), username, role, department_id: deptId ? parseInt(deptId) : null } : null;
        }
    },

    // Posts & Claims Service
    posts: {
        async getAll(filters = {}) {
            let query = '';
            const params = [];
            if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
            if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
            if (filters.department_id) params.push(`department_id=${filters.department_id}`);
            if (params.length) query = `?${params.join('&')}`;
            return await request(`/api/posts${query}`);
        },
        async get(id) {
            return await request(`/api/posts/${id}`);
        },
        async create(postData) {
            return await request('/api/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        },
        async reroute(postId, departmentId) {
            return await request(`/api/posts/${postId}/route?department_id=${departmentId}`, {
                method: 'POST'
            });
        }
    },

    // Incidents Service
    incidents: {
        async getAll() {
            return await request('/api/incidents');
        }
    },

    // Departments Service
    departments: {
        async getAll() {
            return await request('/api/departments');
        }
    },

    // Alerts Service
    alerts: {
        async getAll() {
            return await request('/api/alerts');
        },
        async send(alertData) {
            return await request('/api/alerts', {
                method: 'POST',
                body: JSON.stringify(alertData)
            });
        }
    },

    // Verification Workspace Service
    verification: {
        async submit(postId, status, officialResponse) {
            return await request('/api/verification', {
                method: 'POST',
                body: JSON.stringify({ post_id: postId, status, official_response: officialResponse })
            });
        }
    },

    // Dashboard Statistics Service
    dashboard: {
        async getStats() {
            return await request('/api/dashboard/stats');
        },
        async getCharts() {
            return await request('/api/dashboard/charts');
        }
    },

    // Fact Check Search
    factCheck: {
        async search(query = '') {
            const q = query ? `?q=${encodeURIComponent(query)}` : '';
            return await request(`/api/fact-check${q}`);
        }
    }
};

window.API = API;
