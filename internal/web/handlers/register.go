package handlers

import (
	"encoding/json"
	"net/http"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		helpers.ExecuteTmpl(w, "register.html", 200, "", nil)
		return

	} else if r.Method == http.MethodPost {
		var user db.User
		err := json.NewDecoder(r.Body).Decode(&user)
		defer r.Body.Close()

		if err != nil {
			helpers.ExecuteTmpl(w, "error.html", 400, "Oops! Bad Request error.", nil)
			return
		}

		exist, err := h.DB.DatabaseVerification(user.UserName, user.Email)
		if err != nil {
			helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
			return
		}

		if exist {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"message": "This user already exists"})
			return
		}

		if helpers.IsValidInput(user) == "" {
			err = h.DB.InsertUser(h.Api.Users, user.UserName, user.Email, user.Password)
			if err != nil {
				helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
				return
			}
		}

		w.WriteHeader(302)
	} else {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Oops, Method not allowed.", nil)
		return
	}
}
