package db

type Comment struct {
	Id           int    `json:"id"`
	Content      string `json:"content"`
	UserName     string `json:"username"`
	PosteID      int    `json:"poste_id"`
	CreationDate string `json:"creationDate"`
}

func (d *Database) InsertComment(content, creationDate, userName string, users map[string]*User, postId int) (*Comment, error) {

	userId := users[userName].Id;
	
	InsertComment := `INSERT INTO comments(content, user_id, post_id, creation_date) VALUES(?, ?, ?, DATETIME('now'));`
	stmnt, err := d.db.Prepare(InsertComment)
	if err != nil {
		return &Comment{}, err
	}
	row, err := stmnt.Exec(content, userId, postId)
	if err != nil {
		return &Comment{}, err
	}

	lastInsertId, err := row.LastInsertId()
	if err != nil {
		return &Comment{}, err
	}

	return &Comment{
		Id:           int(lastInsertId),
		Content:      content,
		UserName:     userName,
		PosteID:      postId,
		CreationDate: creationDate,
	}, nil
}
