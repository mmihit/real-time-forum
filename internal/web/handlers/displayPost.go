package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"forum/helpers"
	"forum/internal/db"
)

func (h *Handler) DisplayPostWithComments(w http.ResponseWriter, r *http.Request) {

	isLogged := true
	loggedUser, err := helpers.CheckCookie(r, h.DB)
	if err == http.ErrNoCookie {
		isLogged = false
	} else if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusInternalServerError, "Oops! Internal server error.", nil)
		return
	}
	
	idTarget, err := strconv.Atoi(r.URL.Query().Get("id"))
	fmt.Println(idTarget);
	if err != nil {
		helpers.ExecuteTmpl(w, "error.html", http.StatusBadRequest, "Oops! Bad Request error !", nil)
		return
	}

	for _, user := range h.Api.Users {

		// fmt.Println(*user);
		for _, p := range user.Posts {
			if p.Id == idTarget {
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
