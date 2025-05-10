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
	SessionId string
	Conn      *websocket.Conn
}

type Logout struct {
	Message string `json:"logout"`
}

var (
	clients = make(map[string][]*Client)
	mutex   = &sync.Mutex{}
)

func (h *Handler) WsHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user first
	username, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}
	sessionId, _ := helpers.GetSessionId(r)

	// Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading connection:", err)
		return
	}

	// Create new client
	client := &Client{
		SessionId: sessionId,
		Conn:      conn,
	}

	mutex.Lock()
	go h.handleSessions(username, client)
	mutex.Unlock()

	// Cleanup when connection is closed
	defer func() {
		conn.Close()
		mutex.Lock()

		clients[username] = removeClient(clients[username], client)
		if len(clients[username]) == 0 {
			delete(clients, username)
		}

		mutex.Unlock()

		go h.broadcastOnlineUsers()
	}()


	// Message handling loop
	for {

		_, err := helpers.CheckCookie(r, h.DB)
		if err != nil {
			helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
			conn.Close()
			break
		}

		messageType, messageBytes, err := conn.ReadMessage()
		if err != nil {
			break
		}

		if messageType != websocket.TextMessage {
			continue
		}

		// Try to parse as typing event.
		var typing Typing
		if err := json.Unmarshal(messageBytes, &typing); err == nil && typing.Type == "IsTyping" {
			go h.handleTyping(typing)
			continue
		}

		// Otherwise, try to parse as a chat message.
		var chat Chat
		if err := json.Unmarshal(messageBytes, &chat); err == nil && chat.Message != "" {
			// Security check: ensure the message sender matches the authenticated user
			if chat.Sender != username {
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
	mutex.Unlock()
}

func (h *Handler) handleSessions(loggedUser string, loggedClient *Client) {
	mutex.Lock()

	var Logout Logout
	Logout.Message = "logout"
	Message, _ := json.Marshal(&Logout)
	_, exist := clients[loggedUser]
	if !exist {
		clients[loggedUser] = append(clients[loggedUser], loggedClient)
	} else {
		for _, client := range clients[loggedUser] {
			if client.SessionId != loggedClient.SessionId {
				client.Conn.WriteMessage(websocket.TextMessage, Message)
				removeClient(clients[loggedUser], client)
				client.Conn.Close()
				fmt.Println("getOutPlease: ", loggedUser)
			}
		}
		clients[loggedUser] = append(clients[loggedUser], loggedClient)
	}
	mutex.Unlock()

	h.broadcastOnlineUsers()
}
