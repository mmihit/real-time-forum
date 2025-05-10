package main

import (
	"log"
	"net/http"

	"forum/internal/web/server"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	app, err := server.InitApp()
	if err != nil {
		log.Fatal(err)
	}

	serveur := http.Server{
		Addr:    ":8080",
		Handler: app.Routes(),
	}

	log.Println("\u001b[38;2;255;165;0mListing on http://localhost" + serveur.Addr + "...\033[0m")
	log.Fatal(serveur.ListenAndServe())
}