package server

import (
	"net/http"
)

func (a *App) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./assets/static/"))))

	mux.HandleFunc("/", a.Handlers.Home)
	mux.Handle("/register", a.Handlers.RedirectMiddleware(a.Handlers.Register))
	mux.Handle("/login", a.Handlers.RedirectMiddleware(a.Handlers.Login))
	mux.HandleFunc("/logout", a.Handlers.Logout)
	mux.Handle("/posts/create", a.Handlers.AccessMiddleware(a.Handlers.CreatePost))
	mux.Handle("/users/", a.Handlers.AccessMiddleware(a.Handlers.UserPosts))
	mux.HandleFunc("/posts/", a.Handlers.DisplayPost)
	mux.HandleFunc("/api", a.Api.ApiHome)
	mux.HandleFunc("/api/posts", a.Api.GetPosts)
	mux.HandleFunc("/api/posts/", a.Api.GetPost)
	mux.HandleFunc("/api/users", a.Api.GetUsers)
	mux.HandleFunc("/api/users/", a.Api.GetUser)

	return mux
}
