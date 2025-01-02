package main

import (
	"log"
	"net/http"

	// "log"
	// "net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	a, err := AppSetup()
	if err != nil {
		log.Fatal(err)
	}

	if err := a.GetUsers(); err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/", a.HomeHandler)
	mux.HandleFunc("/posts/create", a.CreatePostHandler)
	mux.HandleFunc("/posts", a.UserPostsHandler)
	mux.HandleFunc("/api", a.CreateApi)

	log.Print("Starting server on http://localhost:8080\n...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
