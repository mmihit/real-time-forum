package main

import (
	"net/http"
	"time"
)

func (a *App) CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	userName := r.URL.Query().Get("user")

	switch r.Method {
	case http.MethodGet:
		ExecuteTmpl(w, "create_post_page.html", http.StatusInternalServerError, "", userName)
		return

	case http.MethodPost:

		r.ParseForm()
		title := r.FormValue("title")
		content := r.FormValue("content")
		categories := r.Form["categories"]

		user := a.Users[userName]

		post, err := a.db.InsertPostWithCategories(a.Users, userName, title, content, time.Now().Format(time.ANSIC), categories)
		if len(post.Errors) != 0 {
			ExecuteTmpl(w, "create_post_page.html", http.StatusNotAcceptable, "", post)
			return
		}
		if err != nil {
			ExecuteTmpl(w, "error_page.html", http.StatusInternalServerError, err.Error(), nil)
			return

		}

		user.Posts = append(user.Posts, *post)

		a.Users[userName] = user

		http.Redirect(w, r, "/", http.StatusSeeOther)

	default:
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

}

func (a *App) UserPostsHandler(w http.ResponseWriter, r *http.Request) {
	ExecuteTmpl(w, "logged_user_page.html", http.StatusOK, "", a)
}
