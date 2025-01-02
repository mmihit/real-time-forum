package main

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"forum/internal/models"
)

func (a *App) CreateApi(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a.Posts)
}

func (a *App) GetUsers() error {

	selectUsers := `SELECT users.user_id, users.user_name, users.email, 
	posts.post_id, posts.title, posts.content, posts.creation_date,
	post_category.category, categories.category
	FROM users 
	LEFT JOIN posts 
	ON users.user_id=posts.user 
	LEFT JOIN post_category
	ON posts.post_id=post_category.post
	LEFT JOIN categories
	ON post_category.post=categories.category_id 
	ORDER BY posts.creation_date DESC;`

	rows, err := a.db.db.Query(selectUsers)
	if err != nil {
		return err
	}

	defer rows.Close()

	for rows.Next() {
		u := models.User{}
		p := models.Post{}

		var (
			postId       sql.NullInt64
			title        sql.NullString
			content      sql.NullString
			creationDate sql.NullString
			categoryId   sql.NullInt64
			category     sql.NullString
		)

		if err := rows.Scan(&u.Id, &u.UserName, &u.Login.Email, &postId, &title, &content, &creationDate, &categoryId, &category); err != nil {
			return err
		}

		if postId.Valid && title.Valid && content.Valid && creationDate.Valid {
			p.Id = postId.Int64
			p.User = u.UserName
			p.Title = title.String
			p.Content = content.String
			p.CreationDate = creationDate.String
			if categoryId.Valid && category.Valid {
				p.Categories = append(p.Categories, category.String)
			}
			a.Posts = append(a.Posts, &p)
		}

		a.Users[u.UserName] = &u

	}

	return nil
}
