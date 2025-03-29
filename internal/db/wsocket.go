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

func(d *Database) GetIdOfSenderOrReciever(user string) (int, error){

    var Id int

     err := d.db.QueryRow("SELECT id FROM users WHERE username = ?", user).Scan(&Id)
     if err != nil {
         return Id,err
     }

     return Id, nil
}

func(d *Database) IsUserExistsInDatabase(receiver string) bool {

    var exists bool
    err := d.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)", receiver).Scan(&exists)

    if err != nil {

        return false
    }
    return exists
}

func(d *Database) InsertMessageInDatabase(sender, receiver, message string) error {

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

    stmt, err := d.db.Prepare(query)
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

func (d *Database) GetChatHistory(sender, receiver string) ([]Chat, error) {

    queryOfFetchingChatHistory := `SELECT c.id, u1.username AS sender_username, u2.username AS receiver_username,
                        c.sender_id,
                        c.receiver_id,
                        c.message,
                        c.create_date 
                        FROM chats c
                        JOIN users u1 ON c.sender_id = u1.id
                        JOIN users u2 ON c.receiver_id = u2.id
                        WHERE (c.sender_id = ? AND c.receiver_id = ?) OR (c.sender_id = ? AND c.receiver_id = ?)
                        ORDER BY c.create_date ASC;`

    senderID, err := d.GetIdOfSenderOrReciever(sender)
    if err != nil {
        return nil, fmt.Errorf("User not found: %w", err)
    }

    receiverID, err := d.GetIdOfSenderOrReciever(receiver)
    if err != nil {
        return nil, fmt.Errorf("User not found: %w", err)
    }

    rows, err := d.db.Query(queryOfFetchingChatHistory, senderID, receiverID, receiverID, senderID)
    if err != nil {
        return nil, fmt.Errorf("failed fetching chat history from db: %w", err)
    }
    
	defer rows.Close()

	var chats []Chat

	for rows.Next() {
		var chat Chat

		if err := rows.Scan(&chat.ID, &chat.Sender, &chat.Receiver, &chat.SenderID, &chat.ReceiverID, &chat.Message, &chat.CreateDate); err != nil {

			return nil, fmt.Errorf("failed scanning chat history from db : %w", err)
		}
		chats = append(chats, chat)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed iterating over rows: %w", err)
	}

	return chats, nil
}