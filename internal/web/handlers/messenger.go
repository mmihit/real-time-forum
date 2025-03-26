package handlers

import (
	"encoding/json"
	"forum/helpers"
	"net/http"
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
		helpers.ExecuteTmpl(w, "index.html", 200, "", nil)
		return
	} else if r.Method == http.MethodPost {
		var SearchingInputRequest SearchingInputRequest
		var SearchingInputResponse SearchingInputResponse

		defer r.Body.Close()
		if err := json.NewDecoder(r.Body).Decode(&SearchingInputRequest); err != nil {
			helpers.JsonResponse(w, http.StatusBadRequest, "Bad Request: Error decoding JSON.")
			return
		}

		if len(SearchingInputRequest.Input) > 0 && len(SearchingInputRequest.Input) < 40 && SearchingInputRequest.Index >= 0 {
			var err error
			SearchingInputResponse.Users, SearchingInputResponse.IsDone, err = h.DB.SearchUsersInDb(SearchingInputRequest.Input, SearchingInputRequest.Index)
			if err != nil {
				helpers.JsonResponse(w, http.StatusInternalServerError, "Internal error: Oops! Internal Server Error.")
				return
			}
		} else {
			helpers.JsonResponse(w, http.StatusBadRequest, "Invalid input: Please try with a correct input.")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(SearchingInputResponse)
	}
}
