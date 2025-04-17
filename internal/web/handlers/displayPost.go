package handlers

import (
	"net/http"
	"strconv"

	"forum/helpers"
	// "forum/internal/db"
)

// type postData struct {
// 	Post     db.Post
// 	Id       string
// 	UserName string
// }

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
	// fmt.Println(idTarget)
	if err != nil {
		// fmt.Println("teeeeeeeeeest5555")
		helpers.ExecuteTmpl(w, "error.html", http.StatusBadRequest, "Oops! Bad Request error !", nil)
		return
	}
	for _, user := range h.Api.Users {
		for _, p := range user.Posts {
			if p.Id == idTarget {
				h.Api.Params.Post.UserName = ""
				if isLogged {
					h.Api.Params.Post.UserName = loggedUser
				}
				h.Api.Params.Post.Post = p
				helpers.ExecuteTmpl(w, "index.html", http.StatusOK, "", nil)
				return
			}
		}
	}
	// fmt.Println("teeeeeeeeeestaaaaaaaaaaaa")
	// helpers.ExecuteTmpl(w, "error.html", http.StatusBadRequest, "Oops! Bad Request error !", nil)
}
