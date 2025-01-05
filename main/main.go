package main

import (
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	a, err := AppSetup()
	if err != nil {
		log.Fatal(err)
	}

	if err := a.GetPostsFromDB(); err != nil {
		log.Fatal(err)
	}

	

	mux := http.NewServeMux()

	mux.HandleFunc("/", a.HomeHandler)
	mux.HandleFunc("/api/posts", a.FetchPosts)
	mux.HandleFunc("/api/posts/", a.FetchPost)
	mux.HandleFunc("/api/users", a.FetchUsers)
	mux.HandleFunc("/api/users/", a.FetchUser)

	log.Print("Starting server on http://localhost:8080\n...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
