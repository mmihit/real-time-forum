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


}