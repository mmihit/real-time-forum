package main

import (
	"fmt"
	"strings"

	"forum/internal/models"
)

// func (d *Database) AllPosts() ([]models.Post, error) {
// 	posts := []models.Post{}
// 	selectPosts := `SELECT title, content, creation_date, user  FROM posts;`

// 	rows, err := d.db.Query(selectPosts)
// 	if err != nil {
// 		return nil, fmt.Errorf("error selecting posts from posts table: %w", err)
// 	}

// 	defer rows.Close()

// 	for rows.Next() {
// 		post := models.Post{}
// 		if err := rows.Scan(&post.Title, &post.Content, &post.CreationDate); err != nil {
// 			return nil, fmt.Errorf("error scanning posts table rows: %w", err)
// 		}
// 		posts = append(posts, post)
// 	}

// 	if err := rows.Err(); err != nil {
// 		return nil, fmt.Errorf("error iterating through posts table rows: %w", err)
// 	}
// 	// fmt.Println("\033[0;0mposts :---------------------------------------\n\033[0;0m", posts)

// 	return posts, nil
// }

func (d *Database) InsertPost(userId int64, title, content, creationDate string) (int64, error) {
	insertPost := `INSERT INTO posts(user, title, content, creation_date) VALUES(?, ?, ?, datetime('now'));`
	stmnt, err := d.db.Prepare(insertPost)
	if err != nil {
		return 0, fmt.Errorf("error preparing statment for posts table: %w", err)
	}
	row, err := stmnt.Exec(userId, title, content)
	if err != nil {
		return 0, fmt.Errorf("error executing statment for post table: %w", err)
	}

	lastInsertId, err := row.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error  getting the inserted row's id for post table: %w", err)
	}

	return lastInsertId, nil
}

func (d *Database) InsertCategories(postId int, categories []string) error {
	fmt.Println("\033[0;0mcategories :---------------------------------------\n\033[0;0m", categories)

	for _, category := range categories {
		insertCategories := `INSERT INTO post_category(post, category) VALUES(?,?)`
		stmnt, err := d.db.Prepare(insertCategories)
		if err != nil {
			return fmt.Errorf("error preparing statment for post_category table: %w", err)
		}
		_, err = stmnt.Exec(postId, category)
		if err != nil {
			return fmt.Errorf("error executing statment for post_category table: %w", err)
		}
	}
	return nil
}

func (d *Database) SelectCategories(categories []string) ([]string, error) {
	var categoriesIDs []string
	insertCategories := `SELECT * FROM categories`

	rows, err := d.db.Query(insertCategories)
	if err != nil {
		return nil, fmt.Errorf("error selecting categories: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var temp string
		err := rows.Scan(&id, &temp)
		if err != nil {
			return nil, fmt.Errorf("error scanning categories: %w", err)
		}
		for _, category := range categories {
			if strings.ToLower(category) == temp {
				categoriesIDs = append(categoriesIDs, id)
			}
		}
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("error selecting categories: %w", err)
	}

	fmt.Println("\033[0;35mselected categories :---------------------------------------\n\033[0;0m", categoriesIDs)

	return categoriesIDs, nil
}

func (d *Database) InsertPostWithCategories(users map[string]*models.User, userName string, title, content, creationDate string, categories []string) (*models.Post, error) {
	postId, err := d.InsertPost(users[userName].Id, title, content, creationDate)
	if err != nil {
		return &models.Post{}, err
	}

	selectedCategories, err := d.SelectCategories(categories)
	if err != nil {
		return &models.Post{}, err
	}

	if err := d.InsertCategories(int(postId), selectedCategories); err != nil {
		return &models.Post{}, err
	}

	if post := IsValidPost(title, content); len(post.Errors) != 0 {
		return post, nil
	}

	return &models.Post{
		Id:           int(postId),
		User:         userName,
		Title:        title,
		Content:      content,
		CreationDate: creationDate,
		Categories:   categories,
	}, nil
}
