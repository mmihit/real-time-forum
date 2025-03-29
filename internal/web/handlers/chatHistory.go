package handlers

import (
	"encoding/json"
	"net/http"

	"forum/helpers"
)


func (h *Handler) GetChatHistoryHandler(w http.ResponseWriter, r *http.Request) {

	sender, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}

	if r.Method != http.MethodPost {
		helpers.JsonResponse(w, http.StatusMethodNotAllowed, "Oops! Method Not Allowed.")
		return
	}

	receiver := r.URL.Query().Get("receiver")

	if sender == "" || receiver == "" {
		helpers.JsonResponse(w, http.StatusBadRequest, "Sender and receiver are required")
		return
	}

	chatHistory, err := h.DB.GetChatHistory(sender, receiver)
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