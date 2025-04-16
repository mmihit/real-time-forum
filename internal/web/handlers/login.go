package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"forum/helpers"

	"github.com/google/uuid"
)

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		helpers.ExecuteTmpl(w, "index.html", 200, "", nil)
		fmt.Println("tryning....123")
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

		id, userName, err := h.DB.Authenticate(login.Login, login.Password)
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "sign in succeful", "username": userName})
	} else {
		helpers.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed 😥")
		return
	}
}
