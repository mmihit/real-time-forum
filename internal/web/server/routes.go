package server

import (
	"net/http"
)

func (a *App) Routes() http.Handler {
	mux := http.NewServeMux()
	// mux.HandleFunc("/test/",a.Handlers.Test)
	mux.HandleFunc("/static/", a.Handlers.Static)
	mux.HandleFunc("/", a.Handlers.HomePage)                                             //
	mux.Handle("/register", a.Handlers.RedirectMiddleware(a.Handlers.Register))          //
	mux.Handle("/login", a.Handlers.RedirectMiddleware(a.Handlers.Login))                //
	mux.HandleFunc("/logout", a.Handlers.Logout)                                         //
	mux.Handle("/create/post", a.Handlers.AccessMiddleware(a.Handlers.CreatePost))       //
	mux.Handle("/create/comment", a.Handlers.AccessMiddleware(a.Handlers.CreateComment)) //
	mux.Handle("/messenger", a.Handlers.AccessMiddleware(a.Handlers.Messenger))          //
	mux.HandleFunc("/post", a.Handlers.DisplayPostWithComments)                          //
	mux.HandleFunc("/comment/reaction/", a.Handlers.CommentReactions)                    //
	mux.HandleFunc("/post/reaction/", a.Handlers.PostReactions)                          //
	mux.HandleFunc("/api", a.Api.ApiHome)
	mux.HandleFunc("/api/posts", a.Api.GetPosts) //
	mux.HandleFunc("/api/posts/", a.Api.GetPost)
	mux.HandleFunc("/api/comments/", a.Api.GetComment) //
	mux.HandleFunc("/api/users", a.Api.GetUsers)       //
	mux.HandleFunc("/api/users/", a.Api.GetUser)       //
	mux.HandleFunc("/api/params/", a.Api.SendRealTimeTools)
	mux.HandleFunc("/ws", a.Handlers.WsHandler)
	mux.HandleFunc("/api/chat-history", a.Handlers.GetChatHistoryHandler)

	return mux
}
