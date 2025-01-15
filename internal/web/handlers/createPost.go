package handlers

import (
	"net/http"
	"time"
	"encoding/json"
	"forum/helpers"
	"forum/internal/db"
)

type RequestBodyPost struct {
	Title             string   `json:"title"`
	Content           string   `json:"content"`
	Categories []string `json:"selectedCategories"`
}

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	
	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}

	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Oops! Method Not Allowed.", nil)
		return
    }

   var requestBody RequestBodyPost
    if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }


	if post := helpers.IsValidPost(requestBody.Title, requestBody.Content); len(post.Errors) != 0 {
		response := map[string]interface{}{
			"message": "Validation failed",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	post, err := h.DB.InsertPostWithCategories(h.Api.Users, loggedUser, requestBody.Title, requestBody.Content, time.Now().Format("Mon Jan 02 15:04:05 2006"), requestBody.Categories)
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return

	}

	h.Api.Users[post.User].Posts = append([]*db.Post{post}, h.Api.Users[post.User].Posts...)
	h.Api.Posts = append([]*db.Post{post}, h.Api.Posts...)

	 // Respond with a JSON message
	 response := map[string]string{"message": "Post created successfully!"}
	 w.Header().Set("Content-Type", "application/json")
	 json.NewEncoder(w).Encode(response)


}
