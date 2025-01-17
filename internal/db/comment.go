package db

type Comment struct {
	Id           int    `json:"id"`
	Content      string `json:"content"`
	UserName     string `json:"username"`
	PosteID      int    `json:"poste_id"`
	CreationDate string `json:"create_date"`
}

func (d *Database) InsertComment(content, creationDate, userName string, users map[string]*User, postId int) (*Comment, error) {

	userId := users[userName].Id

	InsertComment := `INSERT INTO comments(content, user_id, post_id, create_date) VALUES(?, ?, ?, DATETIME('now'));`
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

func (d *Database) GetAllCommentsFromDataBase(Comments map[int][]*Comment) error {

	QueryOfSelectAllComments := `
	SELECT comments.id, comments.content, users.username, comments.post_id, comments.create_date 
	FROM comments 
	JOIN users ON comments.user_id = users.id;
	`

	rows, err := d.db.Query(QueryOfSelectAllComments);
	if err != nil {
		return err
	}
	defer rows.Close()

	// var comments []*Comment
	for rows.Next() {
		var comment Comment
		if err := rows.Scan(&comment.Id, &comment.Content ,&comment.UserName, &comment.PosteID, &comment.CreationDate); err != nil {
			return err
		}
		Comments[comment.PosteID] = append(Comments[comment.PosteID], &comment)
	}
	return nil
}
