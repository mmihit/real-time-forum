const WebSocketManager = {
    connection: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    messageHandlers: null,
    onlineUsersHandler: null,
    MessageListHandler: null,
    typingHandler: null,
    Users: [],
    navigateToHandle:null,

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
                this.Users = chatData.users;
                this.onlineUsersHandler(chatData.users);

                if (this.MessageListHandler) this.MessageListHandler(chatData.users);

            } else if (chatData.type === "IsTyping") {
                if (this.typingHandler) this.typingHandler(chatData)
                    console.log(`typing now from ${chatData.sender}`)

            } else if (chatData.message) {
                if (this.messageHandlers) this.messageHandlers(chatData);
                if (!window.location.pathname.includes('/messenger')) {
                    if (chatData.sender != localStorage.getItem('user')) {
                        window.showAlert(`${chatData.sender} sent you a  message`);
                    }
                }

            } else {
                this.navigateToHandle()
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
        this.messageHandlers=handler
    },

    registerTypingHandler(handler) {
        this.typingHandler=handler
    },

    initializeLastMessagesListHandler(handler) {
        this.MessageListHandler = handler
    },

    removeMessageHandler() {
        this.messageHandlers = null;
    },

    initializeOnlineUsersHandler(handler) {
        this.onlineUsersHandler = handler
    },

    initializeNavigateToHandler(handler) {
        this.navigateToHandle=handler
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.localStorage.getItem("user")) {
            WebSocketManager.connect();
        }
    }, 1000);
});

window.WebSocketManager = WebSocketManager;