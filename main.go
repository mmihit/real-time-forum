package main

import (
	"database/sql"
	"fmt"

	// "errors"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func CreateAllTablesInDatabase() []string {
	TableUsers := `
				CREATE TABLE IF NOT EXISTS Users (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				username TEXT NOT NULL UNIQUE,
    				email TEXT NOT NULL UNIQUE,
    				password TEXT NULL UNIQUE,
    				create_date DATETIME DEFAULT CURRENT_TIMESTAMP
				);
	`

	TableCategories := `
					CREATE TABLE IF NOT EXISTS Categories (
    					id INTEGER PRIMARY KEY AUTOINCREMENT,
    					name TEXT NOT NULL UNIQUE
					);
	`

	TablePostes := `
	
				CREATE TABLE IF NOT EXISTS Postes (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				title TEXT NOT NULL,
    				content TEXT NOT NULL,
    				user_id INTEGER NOT NULL,
    				categorie_id INTEGER NOT NULL,
    				create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    				FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
    				FOREIGN KEY (categorie_id) REFERENCES Categories (id) ON DELETE CASCADE
				);
	`

	TableComments := `
	
				CREATE TABLE IF NOT EXISTS Comments (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				content TEXT NOT NULL,
    				user_id INTEGER NOT NULL,
    				poste_id INTEGER NOT NULL,
    				create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    				FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
    				FOREIGN KEY (poste_id) REFERENCES Postes (id) ON DELETE CASCADE
				);
	`
	TableLikes := `

			CREATE TABLE IF NOT EXISTS Likes (
    			id INTEGER PRIMARY KEY AUTOINCREMENT,
    			user_id INTEGER NOT NULL,
    			poste_id INTEGER NOT NULL,
    			commente_id INTEGER NOT NULL,
    			create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    			FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
    			FOREIGN KEY (poste_id) REFERENCES Postes (id) ON DELETE CASCADE,
    			FOREIGN KEY (commente_id) REFERENCES Comments (id) ON DELETE CASCADE
			);
	`

	return []string{TableUsers, TableCategories, TablePostes, TableComments, TableLikes}
}

func ExecuteAllTableInDataBase(database *sql.DB) error {

	for _, Table := range CreateAllTablesInDatabase() {

		_, err := database.Exec(Table)
		if err != nil {
			return err
		}
	}
	return nil
}

func PrepareConnectionWithDatabase(DriveName string, DataName string) (*sql.DB, error) {
	database, err := sql.Open(DriveName, DataName)

	return database, err
}

func ValidConnectionWithDatabase(database *sql.DB) error {
	err := database.Ping()

	return err
}

func InsertNewUserInTable(database *sql.DB) error {
	_, err := database.Exec(`INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`, "Kerzazi", "kerzazi@example.com", "123")

	return err
}

func SelectUserFromTable(database *sql.DB) (*sql.Rows, error) {
	rows, err := database.Query("SELECT id, username, email, password FROM Users")

	return rows, err
}

func PrintUser(rows *sql.Rows) {
	fmt.Println("This is All User : ")

	for rows.Next() {

		var Id int
		var Username, Email, Password string

		if err := rows.Scan(&Id, &Username, &Email, &Password); err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}

		fmt.Printf("ID: %d, Username: %s, Email: %s, Password: %s\n", Id, Username, Email, Password)
	}
}

func main() {

	db, err := PrepareConnectionWithDatabase("sqlite3", "./data/database.db")
	if err != nil {
		log.Fatalf(" Error Opening database %v :", err)
	}
	defer db.Close()

	err = ExecuteAllTableInDataBase(db)
	if err != nil {
		log.Fatalf("Error Executing tables : %v", err)
	}

	err = ValidConnectionWithDatabase(db)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	fmt.Println("Database connection successfuly.")

	err = InsertNewUserInTable(db)
	if err != nil {
		log.Fatalf("Error Inserting User : %v", err)
	}

	rows, err := SelectUserFromTable(db)
	if err != nil {
		log.Fatalf("Error querying database : %v", err)
	}

	PrintUser(rows)
}
