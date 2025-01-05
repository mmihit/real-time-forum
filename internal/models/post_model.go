package models

type Post struct {
	Id           int               `json:"id"`
	User         string            `json:"user"`
	Title        string            `json:"title"`
	Content      string            `json:"content"`
	CreationDate string            `json:"creationDate"`
	Categories   []string          `json:"categories,omitempty"`
	Errors       map[string]string 
}

type Login struct {
	Email          string `json:"email"`
	Password       string 
	HashedPassword string 
	SessionToken   string 
	CRSFToken      string
}

type User struct {
	Id       int64             `json:"id"`
	UserName string            `json:"userName"`
	Login    Login             
	Posts    []*Post           `json:"posts,omitempty"`
	Errors   map[string]string
}

