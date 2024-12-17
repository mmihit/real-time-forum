package main

import (
	
	"fmt"
	"forum/data"
	"log"

	_ "github.com/mattn/go-sqlite3"
)


func main() {

	db, err := data.PrepareConnectionWithDatabase("sqlite3", "./data/database.db")
	if err != nil {
		log.Fatalf(" Error Opening database %v :", err)
	}
	defer db.Close()

	err = data.ExecuteAllTableInDataBase(db)
	if err != nil {
		log.Fatalf("Error Executing tables : %v", err)
	}

	err = data.ValidConnectionWithDatabase(db)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	fmt.Println("Database connection successfuly.")

	err = data.InsertNewUserInTable(db)
	if err != nil {
		log.Fatalf("Error Inserting User : %v", err)
	}

	rows, err := data.SelectUserFromTable(db)
	if err != nil {
		log.Fatalf("Error querying database : %v", err)
	}

	data.PrintUser(rows)

}
