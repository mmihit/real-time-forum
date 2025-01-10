package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"forum/helpers"
	"forum/internal/db"
)

type Api struct {
	Endpoints Endpoints           `json:"endpoints"`
	Users     map[string]*db.User `json:"users"`
	Posts     []*db.Post          `json:"posts"`
}

type Endpoints struct {
	PostsEndpoint string `json:"posts"`
	UsersEndpoint string `json:"users"`
}

// https://medium.com/@oshankkumar/project-layout-of-golang-web-application-bae212d8f4b6

func (api *Api) ApiHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Endpoints)
}

func (api *Api) GetPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	api.Endpoints.PostsEndpoint = r.URL.Path

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Posts)
}

func (api *Api) GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	api.Endpoints.UsersEndpoint = r.URL.Path

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Users)
}

func (api *Api) GetPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	idQuery := r.URL.Path[len("/api/posts/"):]

	id, err := strconv.Atoi(idQuery)
	if err != nil {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusInternalServerError, "Internal Server Error!", nil)
		return
	}

	for _, post := range api.Posts {
		if id == post.Id {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(&post)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Post Not Found!"})
}

func (api *Api) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	UserName := r.URL.Path[len("/api/users/"):]

	for _, user := range api.Users {
		if UserName == user.UserName {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(&user)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "User Not Found!"})
}
