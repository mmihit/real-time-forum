export async function CreateComments(username, postId) {
    const content = document.getElementById('commentContent').value.trim();

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
    const commentsContainer = document.getElementById('commentsList');
    console.log(commentsContainer)
    if (response.ok) {
        const comments = await response.json();
        return Array.from(comments).reverse();

    } else {
        const responseData = await response.json();
        console.log('Response:', responseData);
        commentsContainer.innerHTML = "<p>No Comments In This Post</p>"
        alert(responseData.error);
    }
};

export const displayComments = async (postId) => {
    const comments = await fetchComments(postId);

    const commentsContainer = document.getElementById('commentsList');
    if (comments) {
        commentsContainer.innerHTML = ''; // Clear existing comments
        createScrollPagination(comments, RenderComments)
    }
}



const createScrollPagination = (comments, displayCallback) => {
    let startIndex = 0;
    let endIndex = 5;
    const commentsContainer = document.getElementById('commentsList')

    displayCallback(comments.slice(0, endIndex))
    const handleScroll = () => {

        const scrollable = commentsContainer.scrollHeight - commentsContainer.clientHeight
        const scrolled = commentsContainer.scrollTop
        if (Math.ceil(scrolled) >= scrollable && comments.length > endIndex) {
            // isLoading = true

            startIndex = endIndex
            endIndex = Math.min(endIndex + 5, comments.length)

            displayCallback(comments.slice(startIndex, endIndex))

            // isLoading = false
        }
    }
    commentsContainer.addEventListener('scroll', handleScroll);
    commentsContainer.addEventListener('scroll', handleScroll);
  
    return () => commentsContainer('scroll', handleScroll);
}

const loadMoreComments = (() => {
    let startIndex = 0;

    return (comments) => {
        const commentPerLoad = 5;

        if (initialize) {
            startIndex = 0;
        }

        const endIndex = Math.min(startIndex + commentPerLoad, comments.length);
        comments.slice(startIndex, endIndex).forEach((comment) => {
            RenderComments([
                {
                    content: comment.content,
                    username: comment.username,
                    create_date: comment.create_date,
                },
            ]);
        });

        startIndex = endIndex;


        if (endIndex >= comments.length) {
            loadMoreButton.remove();
        }
    };
})();
// Event listeners
// document.addEventListener('DOMContentLoaded', fetchComments);


// Handle form submission
// document.getElementById('commentForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent form from reloading the page
//     await CreateComments();
// });