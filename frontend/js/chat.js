// SENTINEL World Chat Page Controller

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-message-input');
    const mockImageSelect = document.getElementById('chat-mock-image');
    const btnSend = document.getElementById('btn-send-chat');
    const typingIndicator = document.getElementById('typing-indicator');

    const currentUser = API.auth.getCurrentUser() || { id: 1, username: 'civilian' };
    let typingTimer = null;
    let isTypingState = false;

    // Load Chat History on entry
    async function loadChatHistory() {
        try {
            // We fetch the chat logs from the server
            const response = await fetch(`${window.location.origin}/api/messages`);
            if (response.ok) {
                const messages = await response.json();
                chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    appendMessageBubble(msg);
                });
                scrollToBottom();
            }
        } catch (e) {
            console.error("Failed to load chat history:", e);
            chatMessages.innerHTML = '<div class="text-center text-muted">WebSocket online. Live chat enabled.</div>';
        }
    }

    // Append a single chat bubble to container
    function appendMessageBubble(msg) {
        const isSelf = msg.user.id === currentUser.id;
        
        const wrapper = document.createElement('div');
        wrapper.className = `chat-bubble-wrapper animate-msg-appear ${isSelf ? 'self' : ''}`;
        
        let imageMarkup = '';
        if (msg.image_url) {
            imageMarkup = `<img src="${msg.image_url}" style="width:100%; max-width:200px; border-radius:var(--border-radius-sm); margin-top:0.5rem; display:block;">`;
        }

        const roleLabel = msg.user.role === 'ADMIN' ? 'Coordinator' : 
                          msg.user.role === 'STAFF' ? 'Officer' : 'Citizen';

        wrapper.innerHTML = `
            <div class="avatar" style="${isSelf ? 'background-color: var(--color-secondary)' : 'background-color: #475569'}">
                ${msg.user.username[0].toUpperCase()}
            </div>
            <div>
                <span class="text-muted" style="font-size:0.75rem; display:block; margin-bottom:0.2rem; ${isSelf ? 'text-align:right;' : ''}">
                    @${msg.user.username} (${roleLabel})
                </span>
                <div class="chat-bubble">
                    <p style="word-break: break-word;">${msg.content}</p>
                    ${imageMarkup}
                </div>
            </div>
        `;
        
        chatMessages.appendChild(wrapper);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send chat message
    function sendChatMessage() {
        const content = chatInput.value.trim();
        const mockImage = mockImageSelect.value;
        
        if (!content) return;

        // Dispatch via global WebSocket manager
        WS.sendChat(currentUser.id, content, mockImage || null);
        
        // Clear input
        chatInput.value = '';
        mockImageSelect.value = '';
        
        // Stop typing indicator immediately
        stopTyping();
    }

    btnSend.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Typing Indicators triggers
    chatInput.addEventListener('input', () => {
        if (!isTypingState) {
            isTypingState = true;
            WS.sendTyping(currentUser.username, true);
        }
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(stopTyping, 2000);
    });

    function stopTyping() {
        if (isTypingState) {
            isTypingState = false;
            WS.sendTyping(currentUser.username, false);
        }
    }

    // WebSocket real-time incoming listeners
    WS.on('NEW_MESSAGE', (data) => {
        appendMessageBubble(data.message);
        scrollToBottom();
    });

    WS.on('USER_TYPING', (data) => {
        if (data.username === currentUser.username) return;
        
        if (data.is_typing) {
            typingIndicator.textContent = `✍️ ${data.username} is typing...`;
        } else {
            typingIndicator.textContent = '';
        }
    });

    // Initalize
    loadChatHistory();
});
