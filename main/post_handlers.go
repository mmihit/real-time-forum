package main

import (
	"forum/internal/models"
	"net/http"
	"time"
)

func (a *App) CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	userName := r.URL.Query().Get("user")

	switch r.Method {
	case http.MethodGet:
		ExecuteTmpl(w, "create_post_page.html", http.StatusInternalServerError, "", a.Users[userName])
		return

	case http.MethodPost:

		r.ParseForm()
		title := r.FormValue("title")
		content := r.FormValue("content")
		categories := r.Form["categories"]

		post, err := a.db.InsertPostWithCategories(a.Users, userName, title, content, time.Now().Format(time.ANSIC), categories)
		if len(post.Errors) != 0 {
			ExecuteTmpl(w, "create_post_page.html", http.StatusNotAcceptable, "", post)
			return
		}
		if err != nil {
			ExecuteTmpl(w, "error_page.html", http.StatusInternalServerError, err.Error(), nil)
			return

		}

		a.Users[post.User].Posts = append(a.Users[post.User].Posts, post)
		a.Posts = append([]*models.Post{post}, a.Posts...)

		ExecuteTmpl(w, "home_page.html", http.StatusOK, "", a.Users[userName])
		return

	default:
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}
}

func (a *App) UserPostsHandler(w http.ResponseWriter, r *http.Request) {
	userName := r.URL.Query().Get("user")

	ExecuteTmpl(w, "home_page.html", http.StatusOK, "", a.Users[userName])
}
