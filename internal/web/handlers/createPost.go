package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"forum/helpers"
	"forum/internal/db"
)

type RequestBodyPost struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Categories []string `json:"selectedCategories"`
}

type PostResponse struct {
	Message string `json:"message"`
}

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		// response := PostResponse{Message: "Unauthorized: Please log in to continue."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusUnauthorized)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}

	if r.Method != http.MethodPost {
		// response := PostResponse{Message: "Oops! Method Not Allowed."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusMethodNotAllowed)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusMethodNotAllowed, "Oops! Method Not Allowed.")
		return
	}

	var requestBodyOfPost RequestBodyPost

	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(&requestBodyOfPost); err != nil {
		// response := PostResponse{Message: "Bad Request: Error decoding JSON."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusBadRequest, "Bad Request: Error decoding JSON.")
		return
	}

	if err := helpers.IsValidPost(requestBodyOfPost.Title, requestBodyOfPost.Content); err != nil || len(requestBodyOfPost.Categories) == 0 {
		// response := PostResponse{Message: "Invalid input: Content, title and selectedCategories are required."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusBadRequest, "Invalid input: Content, title and selectedCategories are required.")
		return
	}

	post, err := h.DB.InsertPostWithCategories(
		h.Api.Users,
		loggedUser,
		requestBodyOfPost.Title,
		requestBodyOfPost.Content, time.Now().Format("Mon Jan 02 15:04:05 2006"),
		requestBodyOfPost.Categories,
	)
	if err != nil {
		log.Printf("Error inserting post: %v", err)
		// response := PostResponse{Message: "Oops! Internal Server Error."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusInternalServerError)
		// json.NewEncoder(w).Encode(response)
		//return
		helpers.JsonResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error.")
		return

	}

	h.Api.Users[post.User].Posts = append([]*db.Post{post}, h.Api.Users[post.User].Posts...)
	h.Api.Posts = append([]*db.Post{post}, h.Api.Posts...)

	// Respond with a JSON message
	// response := PostResponse{Message: "post created successfully!"}
	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(http.StatusOK)
	// json.NewEncoder(w).Encode(response)
	helpers.JsonResponse(w, http.StatusOK, "post created successfully!")
}
