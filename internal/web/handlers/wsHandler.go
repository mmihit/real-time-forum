package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"forum/helpers"
	"forum/internal/db"

	"github.com/gorilla/websocket"
)

type Chat struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Message  string `json:"message"`
	// typing   bool
}

type OnlineUser struct {
	Type  string           `json:"type"`
	Users []db.OnlineUsers `json:"users"`
}

type Typing struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	IsTyping bool   `json:"isTyping"`
	Type     string `json:"type"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	Conn *websocket.Conn
}

var (
	clients = make(map[string][]*Client)
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
		Conn: conn,
	}

	// Register client in the global clients map
	mutex.Lock()
	clients[username] = append(clients[username], client)
	mutex.Unlock()

	go h.broadcastOnlineUsers()

	// Cleanup when connection is closed
	defer func() {
		conn.Close()
		mutex.Lock()
		_, err := helpers.CheckCookie(r, h.DB)
		if err != nil {
			delete(clients, username)
		} else {
			clients[username] = removeClient(clients[username], client)
			if len(clients[username]) == 0 {
				delete(clients, username)
			}
		}

		mutex.Unlock()

		fmt.Printf("Client disconnected: %s\n", username)
		go h.broadcastOnlineUsers()
	}()

	fmt.Printf("New client connected: %s\n", username)

	// Message handling loop
	for {

		messageType, messageBytes, err := conn.ReadMessage()
		if err != nil {
			fmt.Printf("Error reading message from %s: %v\n", username, err)
			break
		}

		if messageType != websocket.TextMessage {
			fmt.Printf("Ignoring non-text message from %s\n", username)
			continue
		}

		// Try to parse as typing event.
		var typing Typing
		if err := json.Unmarshal(messageBytes, &typing); err == nil && typing.Type == "IsTyping" {
			fmt.Println("Typing : ", typing)
			go h.handleTyping(typing)
			continue
		}

		// Otherwise, try to parse as a chat message.
		var chat Chat
		if err := json.Unmarshal(messageBytes, &chat); err == nil && chat.Message != "" {
			fmt.Println("Chat : ", chat)
			// Security check: ensure the message sender matches the authenticated user
			if chat.Sender != username {
				fmt.Printf("Security warning: %s tried to send message as %s\n", username, chat.Sender)
				chat.Sender = username
			}

			// Process message
			go h.handleMessage(chat)
			continue
		}

	}
}

func removeClient(clientsList []*Client, targetClient *Client) []*Client {
	for i, client := range clientsList {
		if client == targetClient {
			return append(clientsList[:i], clientsList[i+1:]...)
		}
	}
	return clientsList
}

func (h *Handler) handleTyping(typing Typing) {
	msg, err := json.Marshal(typing)
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	if recipientClientsList, ok := clients[typing.Receiver]; ok {
		for _, rclient := range recipientClientsList {
			err = rclient.Conn.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				fmt.Printf("Error sending to %s: %v\n", typing.Receiver, err)
			}
		}
	} else {
		fmt.Printf("Recipient %s not connected\n", typing.Receiver)
	}
}

func (h *Handler) handleMessage(chat Chat) {
	jsonMessage, err := json.Marshal(&chat)
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	if recipientClientsList, exists := clients[chat.Receiver]; exists {
		for _, rclient := range recipientClientsList {
			err = rclient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				fmt.Printf("Error sending to %s: %v\n", chat.Receiver, err)
			}
		}
	} else {
		fmt.Printf("Recipient %s not connected\n", chat.Receiver)
	}

	if senderClientsList, exists := clients[chat.Sender]; exists {
		for _, sclient := range senderClientsList {
			err = sclient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				fmt.Printf("Error sending confirmation to %s: %v\n", chat.Sender, err)
			}
		}
	}

	h.DB.InsertMessageInDatabase(chat.Sender, chat.Receiver, chat.Message)
	go h.broadcastOnlineUsers()
}

func (h *Handler) broadcastOnlineUsers() {
	// Get list of online users
	mutex.Lock()
	userList := make([]string, 0, len(clients))
	for username := range clients {
		userList = append(userList, username)
	}
	mutex.Unlock()

	// Broadcast to all connected clients
	mutex.Lock()
	var OnlineChatUsers []db.OnlineUsers
	for username, clientList := range clients {

		fmt.Println("user", username, clientList)

		var onlineUsers []string
		for _, user := range userList {
			if username != user {
				onlineUsers = append(onlineUsers, user)
			}
		}
		var err error
		OnlineChatUsers, err = h.DB.GetOnlineChatUsers(username, onlineUsers)
		if err != nil {
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

		for _, client := range clientList {
			err = client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				fmt.Printf("Error sending online users to %s: %v\n", username, err)
			}
		}
	}
	fmt.Println("******************")
	mutex.Unlock()
}
