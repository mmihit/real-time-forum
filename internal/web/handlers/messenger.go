package handlers

import (
	"net/http"

	"forum/helpers"
)

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
