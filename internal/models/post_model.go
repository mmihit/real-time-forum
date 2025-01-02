package models

type Post struct {
	Id           int64             `json:"id"`
	User         string            `json:"user"`
	Title        string            `json:"title"`
	Content      string            `json:"content"`
	CreationDate string            `json:"creationDate"`
	Categories   []string          `json:"categories"`
	Errors        map[string]string `json:"-"`
}

type Login struct {
	Email          string `json:"email"`
	Password       string `json:"-"`
	HashedPassword string `json:"-"`
	SessionToken   string `json:"-"`
	CRSFToken      string `json:"-"`
}

type User struct {
	Id       int64             `json:"id"`
	UserName string            `json:"userName"`
	Login    Login             `json:"login"`
	Posts    []Post            `json:"posts"`
	Errors    map[string]string `json:"-"`
}
