package db

import (
	"golang.org/x/crypto/bcrypt"
	"strings"
)


type User struct {
	Id        int64             `json:"id"`
	UserName  string            `json:"name"`
	Age       int               `json:"age"`
	Gender    string            `json:"gender"`
	FirstName string            `json:"firstName"`
	LastName  string            `json:"lastName"`
	Email     string            `json:"email,omitempty"`
	Password  string            `json:"password,omitempty"`
	Token     string            `json:"-"`
	Posts     []*Post           `json:"posts,omitempty"`
	Errors    map[string]string `json:"-,omitempty"`
	Reactions map[string][]int  `json:"reactions,omitempty"`
}

func (d *Database) InsertUser(users map[string]*User, name, gender string, firstname, lastname string, email, Password string, age int) error {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(Password), 12) // 2¹² times
	if err != nil {
		return err
	}

	expression := `INSERT INTO users (username, gender, firstname, lastname, email, password, age)
	VALUES (?, ?, ?, ?, ?, ?, ?)`

	stmnt, err := d.Db.Prepare(expression)
	if err != nil {
		return err
	}

	defer stmnt.Close()

	row, err := stmnt.Exec(name, gender, firstname, lastname, email, passwordHash, age)
	if err != nil {
		return err
	}

	id, err := row.LastInsertId()
	if err != nil {
		return err
	}

	users[name] = &User{
		Id:       id,
		UserName: name,
	}

	return nil
}

func (d *Database) Authenticate(email, Password string) (int, string, error) {
	var id int
	var passwordHash []byte
	var userName string
	
	expression := `SELECT username, id, password From users WHERE email = ? OR username = ?`
	row := d.Db.QueryRow(expression, email, strings.ToLower(email))
	err := row.Scan(&userName, &id, &passwordHash)
	if err != nil {
		return 0, "", err
	}

	err = bcrypt.CompareHashAndPassword(passwordHash, []byte(Password))
	if err != nil {
		return 0, "", err
	}
	return id, userName, nil
}

func (d *Database) InsertToken(id int, token string) error {

	expression := `UPDATE users SET Token = ? WHERE id = ?;`
	_, err := d.Db.Exec(expression, token, id)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) DatabaseVerification(name, email string) (bool, bool, error) {

	// Username Verification
	usernameExists := false
	usernameExpression := `SELECT EXISTS (SELECT * FROM users WHERE username LIKE ?);`
	err := d.Db.QueryRow(usernameExpression, name).Scan(&usernameExists)
	if err != nil {
		return false, false, err
	}

	// email verification
	emailExists := false
	emailExpression := `SELECT EXISTS (SELECT * FROM users WHERE email LIKE ?);`
	err = d.Db.QueryRow(emailExpression, email).Scan(&emailExists)
	if err != nil {
		return false, false, err
	}

	return usernameExists, emailExists, nil
}

func (d *Database) TokenVerification(token string) (string, error) {
	var user User

	expression := `SELECT username FROM users WHERE token = ? `

	row := d.Db.QueryRow(expression, token)

	err := row.Scan(&user.UserName)
	if err != nil {
		return "", err
	}

	return user.UserName, nil
}