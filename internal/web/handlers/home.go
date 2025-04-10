package handlers

import (
	"net/http"

	"forum/helpers"
	"forum/internal/api"
	"forum/internal/db"
)

type Handler struct {
	Api *api.Api
	DB  *db.Database
}

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	// if r.URL.Path != "/" {
	// 	helpers.ExecuteTmpl(w, "error.html", 404, "Oops! Not found", nil)
	// 	return
	// }

	h.Api.Params.Home.UserName = ""

	session, err := r.Cookie("session")
	if err == nil && session != nil {
		userName, err := h.DB.TokenVerification(session.Value)
		if err == nil {
			h.Api.Params.Home.UserName = userName
		} else {
			helpers.DeleteCookie(w)
		}
	}

	helpers.ExecuteTmpl(w, "index.html", 200, "", nil)
}
