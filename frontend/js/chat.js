// SENTINEL World Chat Page Controller

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-message-input');
    const fileInput = document.getElementById('chat-file-input');
    const previewContainer = document.getElementById('chat-upload-preview');
    const previewFilename = document.getElementById('chat-upload-filename');
    const btnRemovePreview = document.getElementById('btn-remove-chat-upload');
    const btnSend = document.getElementById('btn-send-chat');
    const typingIndicator = document.getElementById('typing-indicator');

    const currentUser = API.auth.getCurrentUser() || { id: 1, username: 'civilian' };
    let typingTimer = null;
    let isTypingState = false;
    
    let uploadedImageBase64 = null;
    let lastLoadedMessageId = 0;

    // Load Chat History on entry
    async function loadChatHistory() {
        try {
            const response = await fetch(`${window.location.origin}/api/messages`);
            if (response.ok) {
                const messages = await response.json();
                chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    appendMessageBubble(msg);
                    if (msg.id > lastLoadedMessageId) {
                        lastLoadedMessageId = msg.id;
                    }
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

    // Handle image file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageBase64 = event.target.result;
                previewFilename.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                previewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            clearAttachment();
        }
    });

    btnRemovePreview.addEventListener('click', clearAttachment);

    function clearAttachment() {
        uploadedImageBase64 = null;
        fileInput.value = '';
        previewContainer.style.display = 'none';
        previewFilename.textContent = 'No photo selected';
    }

    // Send chat message
    async function sendChatMessage() {
        const content = chatInput.value.trim();
        
        if (!content && !uploadedImageBase64) return;

        // Clean input field and cache parameters
        const messageText = content;
        const attachmentData = uploadedImageBase64;
        chatInput.value = '';
        clearAttachment();

        // 1. Dispatch via WebSockets if connected
        if (WS && WS.isConnected) {
            WS.sendChat(currentUser.id, messageText, attachmentData || null);
        } else {
            // 2. Fallback: Dispatch via HTTP REST API (for serverless environments like Vercel)
            try {
                const response = await fetch(`${window.location.origin}/api/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': currentUser.id.toString()
                    },
                    body: JSON.stringify({
                        content: messageText,
                        image_url: attachmentData || null
                    })
                });
                if (response.ok) {
                    const msg = await response.json();
                    if (msg.id > lastLoadedMessageId) {
                        appendMessageBubble(msg);
                        lastLoadedMessageId = msg.id;
                        scrollToBottom();
                    }
                }
            } catch (err) {
                console.error("Failed to post message via HTTP REST fallback:", err);
            }
        }
        
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
        if (data.message.id > lastLoadedMessageId) {
            appendMessageBubble(data.message);
            lastLoadedMessageId = data.message.id;
            scrollToBottom();
        }
    });

    WS.on('USER_TYPING', (data) => {
        if (data.username === currentUser.username) return;
        
        if (data.is_typing) {
            typingIndicator.textContent = `✍️ ${data.username} is typing...`;
        } else {
            typingIndicator.textContent = '';
        }
    });

    // Polling fallback to synchronize chat updates when WebSockets are disconnected
    async function pollNewMessages() {
        if (WS && WS.isConnected) return; // WS active, no fallback needed
        
        try {
            const response = await fetch(`${window.location.origin}/api/messages`);
            if (response.ok) {
                const messages = await response.json();
                const newMessages = messages.filter(msg => msg.id > lastLoadedMessageId);
                if (newMessages.length > 0) {
                    newMessages.forEach(msg => {
                        appendMessageBubble(msg);
                        if (msg.id > lastLoadedMessageId) {
                            lastLoadedMessageId = msg.id;
                        }
                    });
                    scrollToBottom();
                }
            }
        } catch (e) {
            console.error("Fallback synchronization error:", e);
        }
    }

    // Start polling loop every 3 seconds
    setInterval(pollNewMessages, 3000);

    // Initialise
    loadChatHistory();
});
