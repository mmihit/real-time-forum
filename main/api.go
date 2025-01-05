package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"forum/internal/models"
)

func (a *App) FetchPosts(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a.Posts)
}

func (a *App) FetchUsers(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a.Users)
}

func (a *App) FetchPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	idQuery := r.URL.Path[len("/api/posts/"):]

	id, err := strconv.Atoi(idQuery)
	if err != nil {
		ExecuteTmpl(w, "error_page.html", http.StatusInternalServerError, "Internal Server Error!", nil)
		return
	}

	for _, post := range a.Posts {
		if id == post.Id {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(&post)
			return
		}

	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Post Not Found!"})
}

func (a *App) FetchUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ExecuteTmpl(w, "error_page.html", http.StatusMethodNotAllowed, "Method Not Allowed!", nil)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	UserName := r.URL.Path[len("/api/users/"):]

	for _, user := range a.Users {
		if UserName == user.UserName {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(&user)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Post Not Found!"})
}

func (a *App) GetPostsFromDB() error {
	selectUsers := `SELECT users.user_id, users.user_name,
	posts.post_id, posts.title, posts.content, posts.creation_date,
	post_category.category, categories.category
	FROM users 
	LEFT JOIN posts 
	ON users.user_id=posts.user 
	LEFT JOIN post_category
	ON posts.post_id=post_category.post
	LEFT JOIN categories
	ON post_category.category=categories.category_id 
	ORDER BY posts.creation_date DESC;`

	rows, err := a.db.db.Query(selectUsers)
	if err != nil {
		return err
	}
	defer rows.Close()


	postsMap := make(map[int]*models.Post)

	// Iterate through the query result
	for rows.Next() {
		var (
			u models.User

			postId       sql.NullInt64
			title        sql.NullString
			content      sql.NullString
			creationDate sql.NullString
			categoryId   sql.NullInt64
			category     sql.NullString
		)

		if err := rows.Scan(&u.Id, &u.UserName, &postId, &title, &content, &creationDate, &categoryId, &category); err != nil {
			return err
		}

	
		if postId.Valid && title.Valid && content.Valid && creationDate.Valid {
			// Check if the post already exists in the map
			post, exists := postsMap[int(postId.Int64)]

			if !exists {
				post = &models.Post{
					Id:           int(postId.Int64),
					User:         u.UserName,
					Title:        title.String,
					Content:      content.String,
					CreationDate: creationDate.String,
				}
				postsMap[int(postId.Int64)] = post
				a.Posts = append(a.Posts, post)
			}

			if categoryId.Valid && category.Valid {
				post.Categories = append(post.Categories, category.String)
			}

			if _, userExists := a.Users[u.UserName]; !userExists {
				a.Users[u.UserName] = &u
			}
			a.Users[u.UserName].Posts = append(a.Users[u.UserName].Posts, post)
		}
	}

	return nil
}
