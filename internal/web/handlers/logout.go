package handlers

import (
	"net/http"

	"forum/helpers"
)

/********************** Logout ********************/
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error.html", 405, "Oops! Method not allowed.", nil)
		return
	}

	userName, _ := helpers.CheckCookie(r, h.DB)

	helpers.DeleteCookie(w, userName, h.DB)

	h.Api.Params.Home.UserName = ""

	http.Redirect(w, r, "/login", http.StatusFound)
}
