package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"forum/helpers"

	"github.com/google/uuid"
)

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		helpers.ExecuteTmpl(w, "login.html", 200, "", nil)
		return
	} else if r.Method == http.MethodPost {
		type Slogin struct {
			Login    string `json:"email,omitempty"`
			Password string `json:"password,omitempty"`
		}
		var login Slogin
		err := json.NewDecoder(r.Body).Decode(&login)
		defer r.Body.Close()

		if err != nil {
			helpers.JsonResponse(w, http.StatusBadRequest, "Bad Request 🫤")
			return
		}

		id, err := h.DB.Authenticate(login.Login, login.Password,)
		if err != nil {
			if err == sql.ErrNoRows || strings.Contains(err.Error(), "hashedPassword") {
				helpers.JsonResponse(w, http.StatusConflict, "Email or Password is invalid 🧐")
				return
			} else {
				helpers.JsonResponse(w, http.StatusInternalServerError, "Internal server error 😥")
				return
			}
		}

		token := uuid.New().String()

		if err := h.DB.InsertToken(id, token); err != nil {
			helpers.JsonResponse(w, http.StatusInternalServerError, "Internal server error 😥")
			return
		}

		helpers.AddCookie(w, token)

	} else {
		helpers.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed 😥")
		return
	}
}