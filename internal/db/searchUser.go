package db

import (
	"fmt"
)

func (d *Database) SearchUsersInDb(input string, index int) ([]string, bool, error) {
	var Users []string
	var isDone bool = false

	// Calculate offset for pagination
	const usersPerPage = 10
	offset := index * usersPerPage

	// Query to search users with pagination
	query := `
		SELECT username 
		FROM users 
		WHERE username LIKE ?
		ORDER BY username
		LIMIT ? OFFSET ?
	`

	// Add wildcards for partial matching
	searchPattern := "%" + input + "%"

	rows, err := d.db.Query(query, searchPattern, usersPerPage+1, offset)
	if err != nil {
		return nil, isDone, fmt.Errorf("error querying users: %v", err)
	}
	defer rows.Close()

	// Iterate through results
	count := 0
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return nil, isDone, fmt.Errorf("error scanning user row: %v", err)
		}

		// Only add the first usersPerPage results to our return array
		if count < usersPerPage {
			Users = append(Users, username)
		}
		count++
	}

	if err = rows.Err(); err != nil {
		return nil, isDone, fmt.Errorf("error iterating user rows: %v", err)
	}

	// If we fetched usersPerPage or fewer, then there are no more results
	isDone = (count <= usersPerPage)

	return Users, isDone, nil
}
