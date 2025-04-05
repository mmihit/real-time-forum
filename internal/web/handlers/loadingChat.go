package handlers

import (
	"encoding/json"
	"fmt"
	"forum/helpers"
	"net/http"
)

type LoadingChatRequest struct {
	// Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Id       int    `json:"index"`
	Page     int    `json:"page"`
}

func (h *Handler) LoadMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	} else {
		var LoadingChatRequest LoadingChatRequest

		err := json.NewDecoder(r.Body).Decode(&LoadingChatRequest)
		if err != nil {
			helpers.JsonResponse(w, http.StatusInternalServerError, "Error of loading chat")
		}

		fmt.Println("id:", LoadingChatRequest.Id)

		sender, err := helpers.CheckCookie(r, h.DB)
		if err != nil {
			helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
			return
		}

		chatHistory, err := h.DB.GetChatHistory(sender, LoadingChatRequest.Receiver, LoadingChatRequest.Id, LoadingChatRequest.Page)
		if err != nil {
			helpers.JsonResponse(w, http.StatusInternalServerError, "Error fetching chat history")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(chatHistory)
		if err != nil {
			helpers.JsonResponse(w, http.StatusInternalServerError, "Error encoding chat history")
		}
	}
}
