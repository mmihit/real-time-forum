// Global WebSocket management
const WebSocketManager = {
    connection: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    messageHandlers: [],
    onlineUsersHandler: null,
    Users: [],

    connect() {
        if (this.connection && (this.connection.readyState === WebSocket.OPEN)) {
            console.log("WebSocket already connected or connecting");
            return;
        }

        const wsUrl = `ws://${window.location.host}/ws`;
        this.connection = new WebSocket(wsUrl);

        this.connection.onopen = () => {
            console.log("Connected to WebSocket server");
            this.isConnected = true;
            this.reconnectAttempts = 0;
        };

        this.connection.onmessage = (event) => {
            const chatData = JSON.parse(event.data);

            if (chatData.type === "online_users") {
                this.onlineUsersHandler(chatData.users)
                this.Users = chatData.users
            } else {
                // Notify all registered handlers
                this.messageHandlers.forEach(handler => handler(chatData));
                // Default notification if not on messenger page
                if (!window.location.pathname.includes('/messenger')) {
                    window.showAlert(`${chatData.sender} sent you a  message`);
                }
            }


        };

        this.connection.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
            this.isConnected = false;

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
            } else {
                console.error("Max reconnection attempts reached");
            }
        };

        this.connection.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    },

    // Send a message through the WebSocket
    sendMessage(message) {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(message));
            return true;
        } else {
            console.error("WebSocket not connected, reconnecting...");
            this.connect();
            return false;
        }
    },

    // Register a message handler for specific pages
    registerMessageHandler(handler) {
        if (!this.messageHandlers.includes(handler)) {
            this.messageHandlers.push(handler);
        }
    },

    // Remove a message handler when leaving a page
    removeMessageHandler(handler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index !== -1) {
            this.messageHandlers.splice(index, 1);
        }
    },

    initializeOnlineUsersHandler(handler) {
        this.onlineUsersHandler = handler
    },

    // Show a notification for new messages
    // showNotification(chatData) {
    //     // Use the existing alert function or custom notification
    //     if (typeof alert === 'function') {
    //         alert(`${chatData.sender} sent you a message`);
    //     } else {
    //         console.log("New message from:", chatData.sender);
    //     }
    // }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.loggedUser) {
            WebSocketManager.connect();
        }
    }, 1000);
});

window.WebSocketManager = WebSocketManager;