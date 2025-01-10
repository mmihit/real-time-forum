package handlers

import (
	"net/http"
	"strconv"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) DisplayPost(w http.ResponseWriter, r *http.Request) {
	isLogged := true
	id := r.URL.Path[len("/posts/"):]

	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err == http.ErrNoCookie {
		isLogged = false
	} else if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}
	
	for _, user := range h.Api.Users {

		for _, p := range user.Posts {
			if strconv.Itoa(p.Id) == id {
				userName := ""
				if isLogged {
					userName = loggedUser
				}
				helpers.ExecuteTmpl(w, "display_post.html", http.StatusOK, "", &db.User{
					UserName: userName,
					Posts:    append([]*db.Post{}, p),
				})
				return

			}
		}
	}

}
