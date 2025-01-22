export async function CreateComments(username, postId) {
    console.log("test")
    const content = document.getElementById('commentContent').value.trim();
    console.log(username);

    // Validate inputs
    if (!content) {
        return alert("Please fill in all fields correctly!");
    }
    const requestBody = {
        postId,
        content
    };
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
        displayComments(postId)
        console.log('Response:', responseData);
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



export const fetchComments = async (postId) => {
    const response = await fetch(`/api/comments/${postId}`);
    if (response.ok) {
        const comments = await response.json();
        return Array.from(comments).reverse();

    } else {
        const responseData = await response.json();
        console.log('Response:', responseData);
        alert(responseData.error);
    }
};

export const displayComments = async (postId) => {
    const comments = await fetchComments(postId);

    const commentsContainer = document.getElementById('commentsList');
    commentsContainer.innerHTML = ''; // Clear existing comments
    loadMoreComments(comments,true)
    commentsContainer.insertAdjacentHTML('beforeend', '<a id=load-more-comments>load more comments...</a>');
    const loadMoreButton = document.getElementById('load-more-comments')
    console.log(loadMoreButton)
    loadMoreButton.addEventListener('click', (e)=>{
        e.preventDefault
        loadMoreComments(comments)
    })
}

const loadMoreComments = (comments,initialize) => {
    // const commentsContainer = document.getElementById('commentsList');
    const commentPerLoad = 5
    let startIndex = initialize ? 0 : commentPerLoad
    let endIndex = Math.min(startIndex + commentPerLoad, comments.length)
    console.log(startIndex)

    comments.slice(startIndex, endIndex).forEach(comment => {
        RenderComments([{
            content: comment.content,
            username: comment.username,
            create_date: comment.create_date
        }]);
    });

    if (endIndex >= comments.length) {
        const loadMoreButton = document.getElementById('load-more-comments')
        loadMoreButton.remove()
    }
}
// Event listeners
// document.addEventListener('DOMContentLoaded', fetchComments);


// Handle form submission
// document.getElementById('commentForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent form from reloading the page
//     await CreateComments();
// });