// SENTINEL WebSocket Real-Time Client

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.reconnectTimeout = 3000;
        this.isConnected = false;
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        console.log(`Connecting to WebSocket: ${wsUrl}`);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket Connection Established.');
            this.isConnected = true;
            this.triggerEvent('status_change', { connected: true });
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        this.socket.onclose = () => {
            console.warn('WebSocket connection closed. Retrying...');
            this.isConnected = false;
            this.triggerEvent('status_change', { connected: false });
            setTimeout(() => this.connect(), this.reconnectTimeout);
        };

        this.socket.onerror = (err) => {
            console.error('WebSocket encountered error:', err);
            this.socket.close();
        };
    }

    handleMessage(data) {
        const msgType = data.type;
        console.log(`Received WebSocket Message [${msgType}]:`, data);

        // General event routing
        this.triggerEvent(msgType, data);
        this.triggerEvent('all_messages', data);

        // Global Alert handler
        if (msgType === 'CRITICAL_ALERT_BROADCAST') {
            this.spawnEmergencyOverlay(data.alert);
        }
    }

    // Event system registration
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    triggerEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    sendMessage(messageObj) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(messageObj));
        } else {
            console.error('WebSocket is not open. Message queued or discarded.');
        }
    }

    sendChat(userId, content, imageUrl = null) {
        this.sendMessage({
            type: 'SEND_MESSAGE',
            user_id: userId,
            content: content,
            image_url: imageUrl
        });
    }

    sendTyping(username, isTyping) {
        this.sendMessage({
            type: 'TYPING',
            username: username,
            is_typing: isTyping
        });
    }

    spawnEmergencyOverlay(alert) {
        // Build a floating alert card overlay that shakes and pulses
        const overlay = document.createElement('div');
        overlay.id = 'emergency-alert-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '2rem';
        overlay.style.backdropFilter = 'blur(10px)';

        overlay.innerHTML = `
            <div class="card animate-emergency-pulse" style="max-width: 600px; width: 100%; border: 3px solid var(--color-critical); border-radius: 20px; padding: 2.5rem; text-align: center; color: white;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem; color: #ff007f;">⚠️</div>
                <h1 style="font-size: 2rem; font-family: 'Poppins', sans-serif; margin-bottom: 0.5rem; color: #ff007f;">CRITICAL EMERGENCY ALERT</h1>
                <h3 style="text-transform: uppercase; font-size: 1.1rem; letter-spacing: 1px; margin-bottom: 1.5rem; opacity: 0.9;">
                    ${alert.alert_type} INCIDENT DETECTED IN ${alert.location}
                </h3>
                <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1.5rem 0;">
                    ${alert.message}
                </p>
                <div style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 2rem;">
                    Targeting radius: ${alert.radius_km} km • Broadcast via: ${alert.channels.join(', ').toUpperCase()}
                </div>
                <button class="btn btn-danger" style="padding: 0.75rem 2.5rem; font-size: 1.1rem; font-weight: 700; width: auto;" onclick="document.getElementById('emergency-alert-overlay').remove()">
                    ACKNOWLEDGE & CLOSE
                </button>
            </div>
        `;
        
        // Add vibration support for mobile if available
        if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300, 100, 500]);
        }

        document.body.appendChild(overlay);
        
        // Play critical tone
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, context.currentTime); // Standard emergency pitch
            gain.gain.setValueAtTime(0.08, context.currentTime);
            osc.start();
            
            // Pulse sound
            setTimeout(() => osc.stop(), 1000);
        } catch (e) {
            console.warn("Audio Context blocked by browser auto-play policy.", e);
        }
    }
}

// Global WebSocket Client instance
const WS = new WebSocketClient();
window.WS = WS;
WS.connect();
