package models

type Post struct {
	Id           int               `json:"id"`
	User         string            `json:"user"`
	Title        string            `json:"title"`
	Content      string            `json:"content"`
	CreationDate string            `json:"creationDate"`
	Categories   []string          `json:"categories,omitempty"`
	Total        int               `json:"total"`
	Errors       map[string]string `json:"-,omitempty"`
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
	Login    Login            `json:"-"`
	Posts    []*Post           `json:"posts,omitempty"`
	Errors   map[string]string `json:"-,omitempty"`
}

