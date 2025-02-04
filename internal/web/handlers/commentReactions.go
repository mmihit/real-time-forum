package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) CommentReactions(w http.ResponseWriter, r *http.Request) {

	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		// response := CommentResponse{Message: "Unauthorized: Please log in to continue."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusUnauthorized)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
		return
	}

	if r.Method != http.MethodPost {
		// response := CommentResponse{Message: "Oops! Method Not Allowed."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusMethodNotAllowed)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusMethodNotAllowed, "Oops! Method Not Allowed.")
		return
	}

	var userReaction db.UserReaction

	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(&userReaction); err != nil {
		// response := CommentResponse{Message: "Bad Request: Error decoding JSON."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusBadRequest, "Bad Request: Error decoding JSON.")
		return
	}

	postId, err := strconv.Atoi(userReaction.PostId)
	if err != nil {
		// response := CommentResponse{Message: "Invalid: postId is not correct."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusBadRequest, "Invalid: postId is not correct.")
		return
	}

	commentId, err := strconv.Atoi(userReaction.CommentId)
	if err != nil {
		// response := CommentResponse{Message: "Invalid: commentId is not correct."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusBadRequest)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusBadRequest, "Invalid: commentId is not correct.")
		return
	}

	lastReaction, err := h.DB.GetCommentReactionFromDB(loggedUser, userReaction)
	if err != nil && err != sql.ErrNoRows {
		// response := CommentResponse{Message: "Oops! Internal Server Error."}
		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusInternalServerError)
		// json.NewEncoder(w).Encode(response)
		// return
		helpers.JsonResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error.")
		return
	}

	if lastReaction == "" {
		if err := h.DB.InsertCommentReactionInDB(loggedUser, userReaction); err != nil {
			// response := CommentResponse{Message: "Oops! Internal Server Error."}
			// w.Header().Set("Content-Type", "application/json")
			// w.WriteHeader(http.StatusInternalServerError)
			// json.NewEncoder(w).Encode(response)
			// return
			helpers.JsonResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error.")
		    return
		}
	} else {
		if strings.HasPrefix(userReaction.Reaction, "un") {
			if err := h.DB.DeleteCommentReactionInDB(loggedUser, userReaction); err != nil {
				// response := CommentResponse{Message: "Oops! Internal Server Error."}
				// w.Header().Set("Content-Type", "application/json")
				// w.WriteHeader(http.StatusInternalServerError)
				// json.NewEncoder(w).Encode(response)
				// return
				helpers.JsonResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error.")
		        return
			}
		} else {
			if err := h.DB.UpdateCommentReactionInDB(loggedUser, userReaction); err != nil {
				// response := CommentResponse{Message: "Oops! Internal Server Error."}
				// w.Header().Set("Content-Type", "application/json")
				// w.WriteHeader(http.StatusInternalServerError)
				// json.NewEncoder(w).Encode(response)
				// return
				helpers.JsonResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error.")
		        return
			}
		}
		h.Api.DeleteCommentReactionInApi(loggedUser, postId, commentId, userReaction)
	}
	if !strings.HasPrefix(userReaction.Reaction, "un") {
		h.Api.AddCommentReactionInApi(loggedUser, postId, commentId, userReaction)
	}
}
