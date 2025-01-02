package main

import (
	"forum/internal/models"
)

func IsValidPost(title, content string) *models.Post {

	post := &models.Post{
		Errors: make(map[string]string),
	}

	switch {
	case title == "":
		post.Errors["EmptyTitle"] = "Please enter a title!!"
	case len(title) > 25:
		post.Errors["TitleMaxLen"] = "Title lenght exceded!!"
	case content == "":
		post.Errors["EmptyContent"] = "Please enter a content!!"
	}

	return post
}

