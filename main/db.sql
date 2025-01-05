-- database: ./forum.db
-- Use the ▷ button in the top right corner to run the entire file.
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS posts;

-- DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS categories;

-- DROP TABLE IF EXISTS post_likes;
-- DROP TABLE IF EXISTS comment_likes;
-- DROP TABLE IF EXISTS post_category;

CREATE TABLE
    IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_password VARCHAR(255) NOT NULL,
        token VARCHAR(255)
    );

CREATE TABLE
    IF NOT EXISTS posts (
        post_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        creation_date DATETIME DEFAULT current_timestamp,
        post_reaction INTEGER,
        user INTEGER NOT NULL,
        FOREIGN KEY (user) REFERENCES users (user_id),
        FOREIGN KEY (post_reaction) REFERENCES post_likes (reaction_id)
    );

CREATE TABLE
    IF NOT EXISTS post_category (
        post_category_id INTEGER PRIMARY KEY NOT NULL,
        post INTEGER,
        category INTEGER,
        FOREIGN KEY (post) REFERENCES posts (post_id),
        FOREIGN KEY (category) REFERENCES categories (category_id)
    );

CREATE TABLE
    IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category VARCHAR(20) NOT NULL UNIQUE
    );


CREATE TABLE
    IF NOT EXISTS comments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post INTEGER,
        title VARCHAR(255),
        content TEXT NOT NULL,
        creation_date DATETIME,
        comment_like INTEGER,
        user INTEGER,
        FOREIGN KEY (user) REFERENCES users (user_id),
        FOREIGN KEY (post) REFERENCES posts (post_id),
        FOREIGN KEY (comment_like) REFERENCES comment_likes (reaction_id)
    );


CREATE TABLE
    IF NOT EXISTS comment_likes (
        reaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        like_reaction INTEGER,
        deslike_reaction INTEGER
    );

CREATE TABLE
    IF NOT EXISTS post_likes (
        reaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        like_reaction INTEGER,
        deslike_reaction INTEGER
    );

INSERT INTO
    categories (category)
VALUES
    ('sport'),
    ('games'),
    ('news'),
    ('lifestyle'),
    ('food')