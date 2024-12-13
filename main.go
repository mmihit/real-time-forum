package main

import (
	"fmt"
	"database/sql"
	// "errors"
	"log"
	_ "github.com/mattn/go-sqlite3"
)

func PrepareConnectionWithDatabase(TypeOfSql string, DataName string) (*sql.DB, error) {
	
	database, err := sql.Open(TypeOfSql, DataName);

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

	return rows, err;
}

func PrintUser(rows *sql.Rows) {

	fmt.Println("This is All User : ")

	for rows.Next() {

		var Id int;
		var Username, Email, Password string;

		if err := rows.Scan(&Id, &Username, &Email, &Password); err != nil {

			log.Fatalf("Error scanning row: %v", err);
		}

		fmt.Printf("ID: %d, Username: %s, Email: %s, Password: %s\n", Id, Username, Email, Password)
	}

}

func main() {

	
	db, err := PrepareConnectionWithDatabase("sqlite3", "./data/database.db");

	if err != nil {
		log.Fatalf(" Error Opening database %v :", err);
	}
	defer db.Close();

	err = ValidConnectionWithDatabase(db);

	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	fmt.Println("Database connection successfuly.");

	err = InsertNewUserInTable(db)

	if err != nil {
		log.Fatalf("Error Inserting User : %v", err)
	}

	rows, err := SelectUserFromTable(db)

	if err != nil {
		log.Fatalf("Error querying database : %v", err)
	}

	PrintUser(rows);
}