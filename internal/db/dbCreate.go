package db

func (db *Database) CreateAllTablesInDatabase() []string {
	TableUsers := `
	
			-- DROP TABLE IF EXISTS users;
			-- DROP TABLE IF EXISTS posts;
			-- DROP TABLE IF EXISTS comments;
			DROP TABLE IF EXISTS categories;
			-- DROP TABLE IF EXISTS post_likes;
			-- DROP TABLE IF EXISTS comment_likes;
			-- DROP TABLE IF EXISTS post_category;
			-- DROP TABLE IF EXISTS categories;

			CREATE TABLE IF NOT EXISTS users (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				username TEXT NOT NULL,
    				email TEXT NOT NULL,
    				password TEXT NOT NULL,
					token TEXT 
			);
	`

	TableCategories := `
					CREATE TABLE IF NOT EXISTS categories (
    					id INTEGER PRIMARY KEY AUTOINCREMENT,
    					category TEXT NOT NULL UNIQUE
					);
	`

	TablePosts := `
	
				CREATE TABLE IF NOT EXISTS posts (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				title TEXT NOT NULL,
    				content TEXT NOT NULL,
    				user_id INTEGER NOT NULL,
    				creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`
	TablePostsCategories := `
					CREATE TABLE IF NOT EXISTS post_categories (
    				post_id INTEGER NOT NULL,
    				category_id INTEGER NOT NULL,
    				PRIMARY KEY (post_id, category_id),
    				FOREIGN KEY (post_id ) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    				FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	
	`
	TableLikesPosts := `
				CREATE TABLE IF NOT EXISTS post_likes (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					post_id INTEGER NOT NULL,
					create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`

	TableComments := `
				CREATE TABLE IF NOT EXISTS comments (
    				id INTEGER PRIMARY KEY AUTOINCREMENT,
    				content TEXT NOT NULL,
    				user_id INTEGER NOT NULL,
    				post_id INTEGER NOT NULL,
    				create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    				FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`

	TableLikesComments := `
				CREATE TABLE IF NOT EXISTS comments_likes (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					comment_id INTEGER NOT NULL,
					create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE ON UPDATE CASCADE
				);
	`
	TableInsertCategories := `
				INSERT INTO
    				categories (category)
				VALUES
					('sport'),
					('games'),
					('news'),
					('lifestyle'),
					('food')
				`
	return []string{TableUsers, TableCategories, TablePosts, TablePostsCategories, TableLikesPosts, TableComments, TableLikesComments, TableInsertCategories}
}

func (db *Database) ExecuteAllTableInDataBase() error {
	for _, Table := range db.CreateAllTablesInDatabase() {
		_, err := db.db.Exec(Table)
		if err != nil {
			return err
		}
	}
	return nil
}
