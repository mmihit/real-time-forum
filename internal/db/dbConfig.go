package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	Db *sql.DB
}

func (d *Database) CheckCookie() (any, any) {
	panic("unimplemented")
}

func NewDatabase() (*Database, error) {
	db, err := sql.Open("sqlite3", "./internal/db/data.db")
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Database{
		Db: db,
	}, nil
}
