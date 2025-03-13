package api

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"

	"forum/helpers"
	"forum/internal/db"
)

type Api struct {
	Endpoints Endpoints             `json:"endpoints"`
	Users     map[string]*db.User   `json:"users"`
	Posts     []*db.Post            `json:"posts"`
	Comments  map[int][]*db.Comment `json:"comments"`
	Params    *Params               `json:"params"`
}

type Endpoints struct {
	PostsEndpoint   string `json:"posts"`
	UsersEndpoint   string `json:"users"`
	CommentEndpoint string `json:"comments"`
}

type Params struct {
	Home struct {
		UserName string `json:"username"`
	} `json:"home"`
	Post struct {
		Post     *db.Post `json:"post"`
		UserName string   `json:"username"`
	} `json:"post"`
}

// https://medium.com/@oshankkumar/project-layout-of-golang-web-application-bae212d8f4b6

func (api *Api) ApiHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}
	api.Endpoints = Endpoints{
		UsersEndpoint:   "/api/users",
		PostsEndpoint:   "/api/posts",
		CommentEndpoint: "/api/comments/",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Endpoints)
}

func (api *Api) GetPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	api.Endpoints.PostsEndpoint = r.URL.Path

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Posts)
}

func (api *Api) GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	api.Endpoints.UsersEndpoint = r.URL.Path

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&api.Users)
}

func (api *Api) GetComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	idQuery := r.URL.Path[len("/api/comments/"):]

	id, err := strconv.Atoi(idQuery)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"error": "Bad request !!"})
		return
	}

	comments, exists := api.Comments[id]
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Enter the first comment in this post"})
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (api *Api) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.ExecuteTmpl(w, "error.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	UserName := r.URL.Path[len("/api/users/"):]

	user, exists := api.Users[UserName]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("This ${%s} does not exist", UserName)})
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&user)
}

func (api *Api) DeleteCommentReactionInApi(loggedUser string, postId, commentId int, userReaction db.UserReaction) {
	var post *db.Post
	for _, p := range api.Posts {
		if postId == p.Id {
			post = p
			break
		}
	}
	for _, comment := range api.Comments[post.Id] {
		if commentId == comment.Id {

			delete(comment.Reactions, loggedUser)

			if userReaction.Reaction == "undislike" || userReaction.Reaction == "like" {
				comment.Dislikes = int(math.Max(0, float64(comment.Dislikes-1)))
			} else if userReaction.Reaction == "unlike" || userReaction.Reaction == "dislike" {
				comment.Likes = int(math.Max(0, float64(comment.Likes-1)))
			}
			break
		}
	}
}

func (api *Api) AddCommentReactionInApi(loggedUser string, postId, commentId int, userReaction db.UserReaction) {
	var post *db.Post
	for _, p := range api.Posts {
		if postId == p.Id {
			post = p
			break
		}
	}

	for _, comment := range api.Comments[post.Id] {
		if commentId == comment.Id {
			if comment.Reactions == nil {
				comment.Reactions = make(map[string]string)
			}
			comment.Reactions[loggedUser] = userReaction.Reaction
			if userReaction.Reaction == "like" {
				comment.Likes++
			} else if userReaction.Reaction == "dislike" {
				comment.Dislikes++
			}
		}
	}
}

func (api *Api) DeletePostReactionInApi(loggedUser string, postId int, userReaction db.UserReaction) {
	var post *db.Post
	for _, p := range api.Posts {
		if postId == p.Id {
			post = p
			break
		}
	}
	delete(post.Reactions, loggedUser)
	user := api.Users[loggedUser]
	delete(user.Reactions, userReaction.PostId)

	if userReaction.Reaction == "undislike" || userReaction.Reaction == "like" {
		user.Reactions["dislike"] = removePostIdFromReactions(postId, user.Reactions["dislike"])
		post.Dislikes = int(math.Max(0, float64(post.Dislikes-1)))
	} else if userReaction.Reaction == "unlike" || userReaction.Reaction == "dislike" {
		user.Reactions["like"] = removePostIdFromReactions(postId, user.Reactions["like"])
		post.Likes = int(math.Max(0, float64(post.Likes-1)))
	}

	api.Users[loggedUser] = user
}

func (api *Api) AddPostReactionInApi(loggedUser string, postId int, userReaction db.UserReaction) {
	var post *db.Post
	for _, p := range api.Posts {
		if postId == p.Id {
			post = p
			break
		}
	}
	if post.Reactions == nil {
		post.Reactions = make(map[string]string)
	}
	post.Reactions[loggedUser] = userReaction.Reaction
	user := api.Users[loggedUser]

	if user.Reactions == nil {
		user.Reactions = make(map[string][]int)
	}

	if userReaction.Reaction == "like" {
		post.Likes += 1
		user.Reactions["like"] = append(user.Reactions["like"], postId)
		user.Reactions["dislike"] = removePostIdFromReactions(postId, user.Reactions["dislike"])
	} else if userReaction.Reaction == "dislike" {
		post.Dislikes += 1
		user.Reactions["dislike"] = append(user.Reactions["dislike"], postId)
		user.Reactions["like"] = removePostIdFromReactions(postId, user.Reactions["like"])
	}

	api.Users[loggedUser] = user
}

func removePostIdFromReactions(postId int, posts []int) []int {
	var result []int

	for _, id := range posts {
		if id != postId {
			result = append(result, id)
		}
	}
	return result
}

func (api *Api) GetPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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

func (api *Api) SendRealTimeTools(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var response struct {
		// Html   string      `json:"html,omitempty"`
		// Script string      `json:"script,omitempty"`
		Params interface{} `json:"params,omitempty"`
	}

	page := r.URL.Path[len("/api/params/"):]

	switch page {
	case "Home":
		response.Params = api.Params.Home
	case "Post":
		response.Params = api.Params.Post
	default:
		http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(response.Params)
}
