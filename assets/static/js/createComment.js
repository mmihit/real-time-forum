async function CreateComments() {

    const content = document.getElementById('commentContent').value.trim();
    const postId =  parseInt(document.getElementById('IdOfPost').value, 10);;

    // Validate inputs
    if (!content) {
        return alert("Please fill in all fields correctly!");
    }
    const requestBody = {
        content,
        postId
    };

    console.log("Data to be sent:", requestBody);

    try {
        const response = await fetch('/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.log('Error response:', errorMessage);
            return alert(`Error: ${errorMessage || 'Failed to create comment'}`);
        }

        // Process JSON response
        const responseData = await response.json();
        console.log('Response:', responseData);
        alert(responseData.message);

        // Clear form fields and checkboxes
        document.getElementById('IdOfPost').value = '';
        document.getElementById('commentContent').value = '';
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
};


const RenderComments = (comments) => {

    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = ""; 
    if (!comments || comments.length === 0) {
      commentsList.innerHTML = `<p>No comments yet. Be the first to comment!</p>`;
      return;
    }
    comments.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.classList.add("comment-item");
      commentElement.innerHTML = `
                <p class="comment-meta">
                    <strong>${comment.username}</strong> 
                    <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                </p>
                <p class="comment-content">${comment.content}</p>`;
      commentsList.appendChild(commentElement);
    });
};

async function fetchComments(postId) {
    try {
      const res = await fetch(`/get-comments?post_id=${postId}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const comments = await res.json();
      RenderComments(comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }

  const fetchComments = async () => {
    const response = await fetch('/comments/all');
    if (response.ok) {
        const comments = await response.json();
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            RenderComments({
                content: comment.content,
                userId: comment.user_id,
                postId: comment.poste_id
            });
        });
    } else {
        alert('Error fetching comments');
    }
};
  
 