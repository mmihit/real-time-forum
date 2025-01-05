package main

import (
	"net/http"
)

func (a *App) HomeHandler(w http.ResponseWriter, r *http.Request) {
	
	ExecuteTmpl(w, "home_page.html", http.StatusOK, "", nil)
}
