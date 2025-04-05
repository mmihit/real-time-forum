package handlers

import (
	"encoding/json"
	"forum/helpers"
	"net/http"
)

func (h *Handler) GetLoggedUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var headerCode int
	var response = map[string]string{}

	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err != nil {
		headerCode = http.StatusUnauthorized
		response["message"] = "Please log in"
	} else {
		if loggedUser != "" {
			headerCode = http.StatusOK
			response["message"] = loggedUser
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(headerCode)
	json.NewEncoder(w).Encode(&response)
}
