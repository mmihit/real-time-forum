package handlers

import (
	"encoding/json"
	"forum/helpers"
	"forum/internal/db"
	"net/http"

	"github.com/google/uuid"
)

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		helpers.ExecuteTmpl(w, "login.html", 200, "", nil)
		return
	} else if r.Method == http.MethodPost {
		var user db.User
		err := json.NewDecoder(r.Body).Decode(&user)
		defer r.Body.Close()

		if err != nil {
			helpers.ExecuteTmpl(w, "error.html", 400, "Oops! Bad request.", nil)
			return
		}

		id, err := h.DB.Authenticate(
			user.Email, user.Password,
		)

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"message": "Username or Password Invalid"})
			return
		}

		token := uuid.New().String()

		if err := h.DB.InsertToken(id, token); err != nil {
			helpers.ExecuteTmpl(w, "error.html", 500, "Oops! Internal server error.", nil)
			return
		}

		helpers.AddCookie(w, token)
		w.WriteHeader(302) // 302 Found
	} else {
		helpers.ExecuteTmpl(w, "error.html", 405, "Oops! Method not allowed.", nil)
		return
	}

}
