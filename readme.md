
## *FORUM*

### Description

Forum consists of a web forum that allows:

- Communication between users via posts and comments.
- Associating categories to posts.
- Liking and disliking posts and comments.
- Filtering posts.
- **Real-time chatting** between users with presence indication (new).
- **Online users tracking** (new).

### Authors

- El-gharras Kerzazi  
- Mohammed Mihit

### Usage

1. Clone the repository:
```bash
git clone https://learn.zone01oujda.ma/git/mmihit/real-time-forum
```

2. Navigate to the project directory:
```bash
cd forum
```

3. Run the program:
```bash
go run cmd/*
```

4. Open your web browser and go to:
```
http://localhost:8080
```

### Implementation Details

#### SQLite
Used for storing users, posts, comments, likes, and chat logs.

#### Authentication
- Unique email and username required.
- Password encryption (bonus).
- Error feedback for invalid credentials.

#### Communication
- All users can view content.
- Only registered users can create posts and comments.

#### Likes and Dislikes
- Registered users only.
- Visible to all.

#### Filter
Filter posts by:
- Category
- Own posts
- Liked posts

#### Real-time Chat (NEW)
- Built using WebSockets.
- Users can chat live with others.
- Chat status: **"typing..."**, **"online"**, etc.
- Message history saved.
- Display currently online users.
- Handle connection/disconnection smoothly.

### Requirements

- Backend: Go (Golang)
- Database: SQLite
- Frontend: HTML/CSS/JS (WebSocket for real-time chat)
- Use of Go best practices
- Error handling and HTTP status management
- Responsive and interactive UI
