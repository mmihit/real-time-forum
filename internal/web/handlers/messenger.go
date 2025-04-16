package handlers

import (
	"net/http"

	"forum/helpers"
)

type SearchingInputRequest struct {
	Input string `json:"input"`
	Index int    `json:"index"`
}

type SearchingInputResponse struct {
	Users  []string `json:"users"`
	IsDone bool     `json:"isDone"`
}

func (h *Handler) Messenger(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		// fmt.Println(r.URL.Path)
		helpers.ExecuteTmpl(w, "index.html", 200, "", nil)
		return
	} else {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed), nil)
		return
	}
}
