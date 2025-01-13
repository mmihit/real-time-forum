package handlers

import (
	"fmt"
	"net/http"
	"time"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	
	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}

	switch r.Method {
	case http.MethodGet:
		helpers.ExecuteTmpl(w, "Home.html", http.StatusOK, "", h.Api.Users[loggedUser])
		return

	case http.MethodPost:

		r.ParseForm()
		title := r.FormValue("title")
		content := r.FormValue("content")
		categories := r.Form["categories"]

		if post := helpers.IsValidPost(title, content); len(post.Errors) != 0 {
			helpers.ExecuteTmpl(w, "Home.html", http.StatusBadRequest, "Oops! Bad request.", post)
			return
		}

		post, err := h.DB.InsertPostWithCategories(h.Api.Users, loggedUser, title, content, time.Now().Format("Mon Jan 02 15:04:05 2006"), categories)
		if err != nil {
			helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
			return

		}

		h.Api.Users[post.User].Posts = append([]*db.Post{post}, h.Api.Users[post.User].Posts...)

		h.Api.Posts = append([]*db.Post{post}, h.Api.Posts...)

		fmt.Println("posts create posts: ", h.Api.Posts)
		http.Redirect(w, r, "/", http.StatusFound)
		return

	default:
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Oops, Method not allowed.", nil)
		return
	}
}
