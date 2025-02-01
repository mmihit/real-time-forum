export async function CreateComments(postId, callbackReaction) {
    const content = document.getElementById('commentContent').value.trim();

    if (!content) {
        return alert("Please fill in all fields correctly!");
    }
    const requestBody = {
        postId,
        content
    };

    try {    const response = await fetch('/create/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();
        if (response.ok) {
            displayComments(postId, callbackReaction)
            document.getElementById('commentContent').value=""
            return
        } else if (response.status === 401) {
            alert(responseData.message)
            window.location.href = "/login";
            return
        } else {
            const errorMessage = await response.json();
            console.log('Error response:', errorMessage.message);
            return alert(`Error: ${errorMessage.message || 'Failed to create comment'}`);
        }
    } catch (error) {
            console.error("Unexpected error:", error);
            alert("An unexpected error occurred. Please try again later.");
    }
};

const RenderComments = (comments) => {
    const commentsList = document.getElementById("commentsList");
    if (!commentsList) {
        console.error("Element with ID 'commentsList' not found.");
        return;
    }
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = `<p>No comments yet. Be the first to comment!</p>`;
        return;
    }
    comments.forEach((comment) => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("comment-item");
        commentElement.dataset.commentId = comment.id;
        commentElement.innerHTML = `
                <p class="comment-meta">
                    <strong>${comment.username}</strong> 
                    <span class="comment-date">${new Date(
                      comment.create_date
                    ).toLocaleString()}</span>
                </p>
                <p class="comment-content">${comment.content}</p>
                <div class="reactions">
                <div class="like-div">
                    <button class="btn">
                    <span class="material-icons">thumb_up</span>
                    </button>
                    <span class="count">${comment.likes || 0}</span>
                </div>
                <div class="dislike-div">
                    <button class="btn">
                    <span class="material-icons">thumb_down</span>
                    </button>
                    <span class="count">${comment.dislikes || 0}</span>
                </div>
                </div>`;
        commentsList.appendChild(commentElement);
    });
};

const fetchComments = async (postId) => {
    const response = await fetch(`/api/comments/${postId}`, {
    method: 'POST', 
    headers: {
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
        action: "fetchComments" 
    }) 
    });
    const commentsContainer = document.getElementById('commentsList');
    const responseData = await response.json();
    if (response.ok) {
        return Array.from(responseData).reverse();
    } else if (response.status === 404) {
        commentsContainer.innerHTML = `<p>${responseData.message}</p>`;
    } else {
        console.log('Response:', responseData);
        alert(responseData.error);
    }
};

export const displayComments = async (postId, callbackReaction) => {
    const comments = await fetchComments(postId);

    const commentsContainer = document.getElementById('commentsList');
    if (comments) {
        commentsContainer.innerHTML = '';
        RenderComments(comments)
        callbackReaction()
    }
}
