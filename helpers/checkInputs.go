package helpers

import (
	"forum/internal/db"
	"regexp"
)

func IsValidInput(user db.User) string {
	/*********** Name *************/
	nameRegex := `^[A-Za-z0-9_-]{2,15}$`
	NameR := regexp.MustCompile(nameRegex)
	if !NameR.MatchString(user.UserName) || len(user.UserName) > 15 {
		return "invalid name !!!!"
	}

	/*********** Email *************/
	emailRegex := `^(\w+@\w+.[a-zA-Z]+)$` //^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.]{2,}$
	EmailR := regexp.MustCompile(emailRegex)
	if !EmailR.MatchString(user.Email) || len(user.Email) > 30 {
		return "invalid email !!!!"
	}

	/*********** Password *************/
	passwordRegex := `^[A-Za-z\d@$+-_!%*?&]{8,}$`
	PassR := regexp.MustCompile(passwordRegex)
	if !PassR.MatchString(user.Password) || len(user.Password) > 15 {
		return "invalid password"
	}
	return ""
}

func IsValidPost(title, content string) *db.Post {
	post := &db.Post{
		Errors: make(map[string]string),
	}

	switch {
	case title == "":
		post.Errors["EmptyTitle"] = "Please enter a title!!"
	case content == "":
		post.Errors["EmptyContent"] = "Please enter a content!!"
	}

	return post
}
