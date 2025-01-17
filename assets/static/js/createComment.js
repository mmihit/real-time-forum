async function CreateComments() {

    const content = document.getElementById('commentContent').value.trim();
    const username = document.getElementById('Name').value.trim();
    const postId = parseInt(document.getElementById("PostId").textContent.trim());
    console.log(username);
    
    // Validate inputs
    if (!content) {
        return alert("Please fill in all fields correctly!");
    }
    const requestBody = {
        postId,
        content
    };

    console.log("Data to be sent:", requestBody);

    try {
        const response = await fetch('/create/comment', {
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
        var create_date = Date.now();
        RenderComments([{ content, username, create_date }]);
        console.log('Response:', responseData);
        // alert(responseData.message);

        // Clear form fields and checkboxes
        document.getElementById('commentContent').value = '';
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
};


const RenderComments = (comments) => {

    const commentsList = document.getElementById("commentsList");
    if (!commentsList) {
        console.error("Element with ID 'commentsList' not found.");
        return;
      }
    // commentsList.innerHTML = ""; 
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
                    <span class="comment-date">${new Date(comment.create_date).toLocaleString()}</span>
                </p>
                <p class="comment-content">${comment.content}</p>`;
      commentsList.appendChild(commentElement);
    });
};



const fetchComments = async () => {
    const postId = parseInt(document.getElementById("PostId").textContent.trim());
    const response = await fetch(`/api/comments/${postId}`);
    if (response.ok) {
        const comments = await response.json();
        const commentsContainer = document.getElementById('commentsList');
        commentsContainer.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            RenderComments([{
                content: comment.content,
                username: comment.username,
                create_date: comment.create_date
            }]);
        });
    } 
};

// Event listeners
document.addEventListener('DOMContentLoaded', fetchComments);


// Handle form submission
document.getElementById('commentForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from reloading the page
    await CreateComments();
});