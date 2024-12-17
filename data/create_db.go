package data

import (
	"database/sql"
	"fmt"
	"log"
)

func CreateAllTablesInDatabase() []string {

	TableUsers := `
				CREATE TABLE IF NOT EXISTS Users (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				username TEXT NOT NULL,
    				email TEXT NOT NULL,
    				password TEXT NOT NULL,
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
    				FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    				FOREIGN KEY (categorie_id) REFERENCES Categories (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`
	TablePostes_Categories := `
					CREATE TABLE IF NOT EXISTS Postes_Categories (
    				poste_id INTEGER NOT NULL,
    				categorie_id INTEGER NOT NULL,
    				PRIMARY KEY (poste_id, categorie_id),
    				FOREIGN KEY (poste_id ) REFERENCES Postes (id) ON DELETE CASCADE ON UPDATE CASCADE,
    				FOREIGN KEY (categorie_id) REFERENCES Categories (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	
	`
	TableLikes_Postes := `
				CREATE TABLE IF NOT EXISTS Likes_Postes (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					poste_id INTEGER NOT NULL,
					create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (poste_id) REFERENCES Postes (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`

	TableComments := `
				CREATE TABLE IF NOT EXISTS Comments (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				content TEXT NOT NULL,
    				user_id INTEGER NOT NULL,
    				poste_id INTEGER NOT NULL,
    				create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    				FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    				FOREIGN KEY (poste_id) REFERENCES Postes (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`

	TableLikes_Comments := `
				CREATE TABLE IF NOT EXISTS Likes_Comments (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					comment_id INTEGER NOT NULL,
					create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (comment_id) REFERENCES Comments (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`
	return []string{TableUsers, TableCategories, TablePostes, TablePostes_Categories,TableLikes_Postes, TableComments, TableLikes_Comments}
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

// These three functions are for testing the db:

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