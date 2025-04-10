package db

import (
	"fmt"
)

type Chat struct {
	ID         int    `json:"Id"`
	Sender     string `json:"sender"`
	SenderID   int    `json:"senderId"`
	Receiver   string `json:"receiver"`
	ReceiverID int    `json:"receiverId"`
	Message    string `json:"message"`
	CreateDate string `json:"create_date"`
}

type LoadingChatResponse struct {
	Chats   []Chat `json:"chats"`
	HasMore bool   `json:"hasMore"`
}

type OnlineUsers struct {
	UserName string `json:"userName"`
	Status   string `json:"status"`
	LastMessage any `json:"lastMessage"`
}

func (d *Database) GetIdOfSenderOrReciever(user string) (int, error) {

	var Id int

	err := d.Db.QueryRow("SELECT id FROM users WHERE username = ?", user).Scan(&Id)
	if err != nil {
		return Id, err
	}

	return Id, nil
}

func (d *Database) IsUserExistsInDatabase(receiver string) bool {

	var exists bool
	err := d.Db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)", receiver).Scan(&exists)

	if err != nil {

		return false
	}
	return exists
}

func (d *Database) InsertMessageInDatabase(sender, receiver, message string) error {

	if !d.IsUserExistsInDatabase(receiver) {
		return fmt.Errorf("receiver does not exist")
	}

	senderID, err := d.GetIdOfSenderOrReciever(sender)
	if err != nil {
		return fmt.Errorf("User not found: %w", err)
	}

	receiverID, err := d.GetIdOfSenderOrReciever(receiver)
	if err != nil {
		return fmt.Errorf("User not found: %w", err)
	}

	query := `INSERT INTO chats (sender_id, receiver_id, message, create_date) VALUES (?, ?, ?, datetime('now'))`

	stmt, err := d.Db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(senderID, receiverID, message)
	if err != nil {
		return fmt.Errorf("failed to insert message: %w", err)
	}

	return nil
}

func (d *Database) GetChatHistory(sender, receiver string, page int, pageSize int) (LoadingChatResponse, error) {
	var Response LoadingChatResponse

	offset := (page - 1) * pageSize

	queryOfFetchingChatHistory := `SELECT c.id, u1.username AS sender_username, u2.username AS receiver_username,
                        c.sender_id,
                        c.receiver_id,
                        c.message,
                        c.create_date
                        FROM chats c
                        JOIN users u1 ON c.sender_id = u1.id
                        JOIN users u2 ON c.receiver_id = u2.id
                        WHERE (c.sender_id = ? AND c.receiver_id = ?) OR (c.sender_id = ? AND c.receiver_id = ?)
                        ORDER BY c.create_date DESC
                        LIMIT ? OFFSET ?;`

	senderID, err := d.GetIdOfSenderOrReciever(sender)
	if err != nil {
		return Response, fmt.Errorf("User not found: %w", err)
	}

	receiverID, err := d.GetIdOfSenderOrReciever(receiver)
	if err != nil {
		return Response, fmt.Errorf("User not found: %w", err)
	}

	rows, err := d.Db.Query(queryOfFetchingChatHistory, senderID, receiverID, receiverID, senderID, pageSize, offset)
	if err != nil {
		return Response, fmt.Errorf("failed fetching chat history from db: %w", err)
	}

	defer rows.Close()

	for rows.Next() {
		var chat Chat

		if err := rows.Scan(&chat.ID, &chat.Sender, &chat.Receiver, &chat.SenderID, &chat.ReceiverID, &chat.Message, &chat.CreateDate); err != nil {
			return Response, fmt.Errorf("failed scanning chat history from db : %w", err)
		}
		Response.Chats = append(Response.Chats, chat)
	}

	if err := rows.Err(); err != nil {
		return Response, fmt.Errorf("failed iterating over rows: %w", err)
	}

	countQuery := `SELECT COUNT(*)
                   FROM chats c
                   WHERE (c.sender_id = ? AND c.receiver_id = ?) OR (c.sender_id = ? AND c.receiver_id = ?)`

	var totalMessages int
	err = d.Db.QueryRow(countQuery, senderID, receiverID, receiverID, senderID).Scan(&totalMessages)
	if err != nil {
		return Response, fmt.Errorf("failed counting total messages: %w", err)
	}

	Response.HasMore = (offset + len(Response.Chats)) < totalMessages

	// Reverse the order of messages to maintain chronological order
	// Since we're getting the newest messages first (DESC) but want to display oldest first
	if len(Response.Chats) > 1 {
		for i, j := 0, len(Response.Chats)-1; i < j; i, j = i+1, j-1 {
			Response.Chats[i], Response.Chats[j] = Response.Chats[j], Response.Chats[i]
		}
	}

	return Response, nil
}

func IsExist(UserName string, onlineUsers []string) bool {

	for _, User := range onlineUsers {

		if User == UserName {
			return true
		}
	}
	return false
}

func (d *Database) GetOnlineChatUsers(userName string, onlineUsers []string) ([]OnlineUsers, error) {

	queryOfFetchingOnlineChatUsers := `  
SELECT DISTINCT
    u.username,
	c.message
FROM users u
LEFT JOIN (
    -- Subquery li katjib akher message (create_date) bin kol user w luser dyalna
    SELECT 
        CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
        END AS other_user_id,
        MAX(create_date) AS latest_chat_date
    FROM chats
    WHERE sender_id = ? OR receiver_id = ?
    GROUP BY other_user_id
) latest ON latest.other_user_id = u.id
 LEFT JOIN chats c ON (
    ((c.sender_id = ? AND c.receiver_id = u.id) OR 
     (c.sender_id = u.id AND c.receiver_id = ?)) 
     AND c.create_date = latest.latest_chat_date
)
WHERE u.id != ?
ORDER BY 
    -- L-users li 3ndhom chats kayjiu lewlin
    CASE 
        WHEN latest.latest_chat_date IS NULL THEN 2
        ELSE 1 
    END,
    -- Tretib 7sb akher date
    latest.latest_chat_date DESC,
    -- Users li ma3ndhoumš chats kayjiw mertbin alfabitikman
    u.username COLLATE NOCASE
	`

	senderID, err := d.GetIdOfSenderOrReciever(userName)
	if err != nil {
		return nil, fmt.Errorf("User not found: %w", err)
	}

	rows, err := d.Db.Query(queryOfFetchingOnlineChatUsers, senderID, senderID, senderID, senderID, senderID, senderID)
	if err != nil {
		return nil, fmt.Errorf("failed fetching online chat users from db: %w", err)
	}

	defer rows.Close()

	var Users []OnlineUsers
	var user OnlineUsers

	for rows.Next() {

	
		if err := rows.Scan(&user.UserName, &user.LastMessage); err != nil {
			return nil, fmt.Errorf("failed scanning chat history from db : %w", err)
		}

		if IsExist(user.UserName, onlineUsers) {
			user.Status = "Online"
		} else {
			user.Status = "Ofline"
		}

		Users = append(Users, user)

		user = OnlineUsers{}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed iterating over rows: %w", err)
	}

	return Users, nil
}

func (d *Database) SearchUsersInDb(input string, currentUser string, index int) ([]string, bool, error) {
	var Users []string
	var isDone bool = false

	// Calculate offset for pagination
	const usersPerPage = 10
	offset := index * usersPerPage

	// Query to search users with pagination
	query := `
		SELECT username 
		FROM users 
		WHERE username LIKE ? AND username !=?
		ORDER BY username
		LIMIT ? OFFSET ?
	`

	// Add wildcards for partial matching
	searchPattern := "%" + input + "%"

	rows, err := d.Db.Query(query, searchPattern, currentUser, usersPerPage+1, offset)
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
