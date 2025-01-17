package handlers

import (
	"encoding/json"
	"forum/helpers"
	"log"
	"net/http"
	"time"
)

type RequestBodyComment struct {
	IdPost  int    `json:"postId"`
	Content string `json:"content"`
}

func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {

	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}

	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Oops! Method Not Allowed.", nil)
		return
	}

	var comment RequestBodyComment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		log.Printf("Error decoding JSON: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	comments, err := h.DB.InsertComment(comment.Content, time.Now().Format("Mon Jan 02 15:04:05 2006"), loggedUser, h.Api.Users, comment.IdPost)
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}

	h.Api.Comments[comment.IdPost] = append(h.Api.Comments[comment.IdPost], comments)

	// Respond with a JSON message
	response := map[string]string{"message": "Comment created successfully!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
