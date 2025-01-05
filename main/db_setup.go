package main

import (
	"database/sql"
	"fmt"
	"os"

	"forum/internal/models"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

type App struct {
	Users map[string]*models.User
	Posts []*models.Post
	db    *Database
}

func NewDatabase() (*Database, error) {
	db, err := sql.Open("sqlite3", "./forum.db")
	if err != nil {
		return nil, fmt.Errorf("cannot create new database: %w", err)
	}
	return &Database{
		db: db,
	}, nil
}

func (d *Database) CreateTables() error {
	sqlFile, err := os.ReadFile("db.sql")
	if err != nil {
		return fmt.Errorf("error reading database file: %s", err)
	}
	sqlStmnt := string(sqlFile)

	if _, err := d.db.Exec(sqlStmnt); err != nil {
		return fmt.Errorf("error exectuting sql statmentent in the requested tables: %s", err)
	}

	return nil
}

func AppSetup() (*App, error) {
	d, err := NewDatabase()
	if err != nil {
		return nil, err
	}

	if err := d.CreateTables(); err != nil {
		return nil, err
	}

	return &App{
		Users: make(map[string]*models.User),
		db:    d,
	}, nil
}
