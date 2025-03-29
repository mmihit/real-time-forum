package handlers

import (
	"fmt"
	"forum/helpers"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Chats struct {

	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Message  string `json:"message"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan []byte)
	mutex     = &sync.Mutex{}
)

func init() {
	go handleMessages()
}

func (h *Handler) WsHandler(w http.ResponseWriter, r *http.Request) {

	sender, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	defer conn.Close()

	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()

	for {

		var chat Chats
		err := conn.ReadJSON(&chat)
		if err != nil {
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			break
		}
		broadcast <- []byte(chat.Message)

		// Insert chat in database : 

		chat.Sender = sender
		
		if err := h.DB.InsertMessageInDatabase(chat.Sender, chat.Receiver, chat.Message); err != nil {
			fmt.Println("Error :", err)
			return
		}
	}
}

func handleMessages() {
	for {
		message := <-broadcast

		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}
