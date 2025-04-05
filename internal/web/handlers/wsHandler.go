package handlers

import (
	"encoding/json"
	"fmt"
	"forum/helpers"
	"forum/internal/db"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Chat struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Message  string `json:"message"`
}

type OnlineUser struct {
	Type  string           `json:"type"`
	Users []db.OnlineUsers `json:"users"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	Conn     *websocket.Conn
	Username string
}

var (
	clients = make(map[string]*Client)
	mutex   = &sync.Mutex{} // Global mutex for access to the clients map
)

func (h *Handler) WsHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user first
	username, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}

	// Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading connection:", err)
		return
	}

	// Create new client
	client := &Client{
		Conn:     conn,
		Username: username,
	}

	// Register client in the global clients map
	mutex.Lock()
	// If user already has a connection, close the old one
	if existingClient, exists := clients[username]; exists {
		existingClient.Conn.WriteMessage(websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, "New session started"))
		existingClient.Conn.Close()
	}

	clients[username] = client
	mutex.Unlock()

	go h.broadcastOnlineUsers()

	// Cleanup when connection is closed
	defer func() {
		conn.Close()

		mutex.Lock()
		delete(clients, username)
		mutex.Unlock()

		fmt.Printf("Client disconnected: %s\n", username)
		go h.broadcastOnlineUsers()
	}()

	fmt.Printf("New client connected: %s\n", username)

	// Message handling loop
	for {
		var chat Chat
		err := conn.ReadJSON(&chat)
		if err != nil {
			fmt.Printf("Error reading JSON from %s: %v\n", username, err)
			break
		}

		// Security check: ensure the message sender matches the authenticated user
		if chat.Sender != username {
			fmt.Printf("Security warning: %s tried to send message as %s\n", username, chat.Sender)
			chat.Sender = username // Force correct sender
		}

		// Process message
		go h.handleMessage(chat)
	}
}

func (h *Handler) handleMessage(chat Chat) {
	// var h *Handler
	jsonMessage, err := json.Marshal(&chat)
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	if recipientClient, exists := clients[chat.Receiver]; exists {
		err = recipientClient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
			fmt.Printf("Error sending to recipient %s: %v\n", chat.Receiver, err)
		}
	} else {
		fmt.Printf("Recipient %s not connected\n", chat.Receiver)
		// Consider storing messages for offline users in a database
	}

	// Send confirmation to sender
	if senderClient, exists := clients[chat.Sender]; exists {
		err = senderClient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
			fmt.Printf("Error sending confirmation to %s: %v\n", chat.Sender, err)
		}
	}

	h.DB.InsertMessageInDatabase(chat.Sender, chat.Receiver, chat.Message)
}

func (h *Handler) broadcastOnlineUsers() {

	// Get list of online users
	mutex.Lock()
	userList := make([]string, 0, len(clients))
	for username := range clients {
		userList = append(userList, username)
	}
	mutex.Unlock()

	// Create message

	// Broadcast to all connected clients
	mutex.Lock()
	var OnlineChatUsers []db.OnlineUsers
	for username, client := range clients {
		var onlineUsers []string
		for _, user := range userList {
			if username != user {
				onlineUsers = append(onlineUsers, user)
			}
		}
		var err error
		OnlineChatUsers, err = h.DB.GetOnlineChatUsers(username, onlineUsers); if err != nil {
			fmt.Printf("Error: %v\n", err)
			return
		}
		onlineUsersMsg := OnlineUser{
			Type:  "online_users",
			Users: OnlineChatUsers,
		}

		jsonMessage, err := json.Marshal(&onlineUsersMsg)
		if err != nil {
			fmt.Printf("Error marshaling online users: %v\n", err)
			return
		}
		err = client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
			fmt.Printf("Error sending online users to %s: %v\n", client.Username, err)
		}
	}

	mutex.Unlock()
}
