package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) PostReactions(w http.ResponseWriter, r *http.Request) {
	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		fmt.Println("err1", err)
		response := CommentResponse{Message: "Unauthorized: Please log in to continue."}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	if r.Method != http.MethodPost {
		response := CommentResponse{Message: "Oops! Method Not Allowed."}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	var userReaction db.UserReaction

	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(&userReaction); err != nil {
		fmt.Println("err2", err)
		response := CommentResponse{Message: "Bad Request:Error decoding JSON."}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}
	fmt.Println("////////////////////////////////////////////////////////////")
	fmt.Println("userReaction", userReaction)
	fmt.Println("////////////////////////////////////////////////////////////")

	postId, err := strconv.Atoi(userReaction.PostId)
	if err != nil {
		fmt.Println("err3", err)
		response := CommentResponse{Message: "Invalid: postId is not correct."}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// fmt.Println("post id:", postId)

	lastReaction, err := h.DB.GetPostReactionFromDB(loggedUser, userReaction)
	if err != nil && err != sql.ErrNoRows {
		fmt.Println("err4", err)
		fmt.Println("1")
		fmt.Println("1")
		response := CommentResponse{Message: "Oops! Internal Server Error."}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if lastReaction == "" {
		if err := h.DB.InsertPostReactionInDB(loggedUser, userReaction); err != nil {
			fmt.Println("err5", err)
			fmt.Println("2")

			response := CommentResponse{Message: "Oops! Internal Server Error."}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	} else {
		if strings.HasPrefix(userReaction.Reaction, "un") {
			if err := h.DB.DeletePostReactionInDB(loggedUser, userReaction); err != nil {
				fmt.Println("err6", err)
				fmt.Println("3")

				response := CommentResponse{Message: "Oops! Internal Server Error."}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		} else {
			if err := h.DB.UpdatePostReactionInDB(loggedUser, userReaction); err != nil {
				fmt.Println("err7", err)
				fmt.Println("4")

				response := CommentResponse{Message: "Oops! Internal Server Error."}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
		h.Api.DeletePostReactionInApi(loggedUser, postId, userReaction)
	}

	if !strings.HasPrefix(userReaction.Reaction, "un") {
		h.Api.AddPostReactionInApi(loggedUser, postId, userReaction)
	}
}
