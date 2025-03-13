const fetchApi = async (url) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

function removeAllStylesheets() {
    const head = document.head;

    const stylesheets = head.querySelectorAll('link[type="text/css"]');

    stylesheets.forEach(stylesheet => {
        head.removeChild(stylesheet);
    });

    const styleElements = head.querySelectorAll('style');
    styleElements.forEach(styleElement => {
        head.removeChild(styleElement);
    });
}

function addStylesheet(href, type = "text/css") {
    const linkElement = document.createElement("link");

    linkElement.rel = "stylesheet";
    linkElement.type = type;
    linkElement.href = href;

    document.head.appendChild(linkElement);


    return linkElement;
}

async function HomeContent() {
    homeData = await fetchApi(`/api/params/Home`)
    username = homeData.username
    var html = document.getElementById("defaultHtml")
    let htmlTemp = `  <div id="customAlert"></div>

  <!-- Header -->
  <header class="header">
    <div class="site-title">
      <i class="fas fa-comments"></i>
      <a href="/" alt="home">Forum Chat</a>
    </div>

    <div class="dropdown">
      <input type="hidden" id="Name" value="${username}">`

    if (username) {
        htmlTemp += ` <button class="dropdown-button">${username} <i class="fa fa-caret-down" aria-hidden="true"></i></button>
      <div class="dropdown-menu">
        <a href="/logout" alt="logout" id="logout-btn" title="Logout">Logout</a>
        <a href="/posts/create" alt="create post" id="create-post-btn"> + Create</a>
      </div>`
    } else {
        htmlTemp += `      <button class="dropdown-button">Account <i class="fa fa-caret-down" aria-hidden="true"></i></button>
      <div class="dropdown-menu">
        <a href="/login">Login</a>
        <a href="/register">Signup</a>
      </div>`
    }
    htmlTemp += `    </div >
  </header >

        <div id="body">
            <!-- main -->
            <main class="main">
                <div class="card">
                    <button id="All-Posts">All Posts</button>
                    <button id="Post-Created">My Posts</button>
                    <button id="Likes">My Likes</button>
                    <button id="Create-Post"> <i class="fa fa-plus" aria-hidden="true"></i> Create </button>
                    <div class="dropdown">
                        <button class="dropdown-button">Categories <i class="fa fa-caret-down" aria-hidden="true"></i></button>
                        <div class="dropdown-menu">
                            <a data-category="news">News</a>
                            <a data-category="sport">Sport</a>
                            <a data-category="lifestyle">Lifestyle</a>
                            <a data-category="food">Food</a>
                            <a data-category="games">Games</a>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Artical -->
            <div class="artical">
                <div id="post-container"></div>
            </div>

            <!-- Hidden form container -->
            <div class="overlay" id="overlay" style="display: none;">
                <div class="form-container">
                    <h2>Create a New Post</h2>
                    <button class="close-btn" id="closeFormBtn">&times;</button>
                    <form action="/create/post" id="postForm" method="post">
                        <div class="form-group">
                            <label for="title">Title:</label>
                            <input type="text" id="title" maxlength="250" name="title"
                                placeholder="Please provide a title for your post..." required>
                        </div>
                        <div class="form-group">
                            <label for="content">Content:</label>
                            <textarea id="content" maxlength="3000" name="content" placeholder="Write your post here..." rows="5"
                                required></textarea>
                        </div>
                        <fieldset>
                            <legend>Categories:</legend>
                            <div class="checkbox-group">
                                <label><input type="checkbox" name="categories" id="sport" value="sport" checked> Sports</label>
                                <label><input type="checkbox" name="categories" id="games" value="games"> Games</label>
                                <label><input type="checkbox" name="categories" id="news" value="news"> News</label>
                                <label><input type="checkbox" name="categories" id="lifestyle" value="lifestyle">Lifestyle </label>
                                <label><input type="checkbox" name="categories" id="food" value="food"> Food</label>
                            </div>
                        </fieldset>
                        <button type="submit" class="submit-btn">Create Post</button>
                    </form>
                </div>
            </div>
        </div>`
    const container = document.getElementById("dyanamicScript");

    // Create the script module element
    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';

    // Set the content of the script
    scriptModule.textContent = `
          import { getPosts } from "/static/js/displayPosts.js";
          import { userReactions } from "/static/js/reaction.js";
          import { createPosts } from "/static/js/createPost.js"
      
          const UserName = "${username}";
          await getPosts(UserName, () => userReactions(".post", "/api/posts/", "/post/reaction/", UserName));
          await createPosts(UserName, () => getPosts(UserName, () => userReactions(".post", "/api/posts/", "/post/reaction/", UserName)))
        `;

    // Append the script module to the container
    container.appendChild(scriptModule);

    // If username is not provided, add the permission denied script
    if (!username) {
        const permissionScript = document.createElement('script');
        permissionScript.src = "/static/js/permissionDenied.js";
        container.appendChild(permissionScript);
    }

    removeAllStylesheets()
    addStylesheet("/static/css/home.css");
    addStylesheet("/static/css/alert.css");


    html.innerHTML = htmlTemp
}

async function PostContent() {

    const apiData = await fetchApi("/api/params/Post");
    const post = apiData.post;
    const username = apiData.username;

    // Get the default HTML container
    var html = document.getElementById("defaultHtml");

    let htmlTemp = `<div id="customAlert"></div>`;

    // Header section based on username
    if (username) {
        htmlTemp += `
        <!-- Header with user logged in -->
        <header class="header">
            <div class="site-title">
                <i class="fas fa-comments"></i>
                <a href="/" alt="home">Forum Chat</a>
            </div>

            <div class="dropdown">
                <button class="dropdown-button">${username} <i class="fa fa-caret-down" aria-hidden="true"></i></button>
                <div class="dropdown-menu">
                    <a href="/logout" alt="logout" id="logout-btn" title="Logout">Logout</a>
                </div>
            </div>
        </header>`;
    } else {
        htmlTemp += `
        <!-- Header without logged in user -->
        <header class="header">
            <div class="site-title">
                <i class="fas fa-comments"></i>
                <a href="/" alt="home">Forum Chat</a>
            </div>
            <div class="dropdown">
                <button class="dropdown-button">Account <i class="fa fa-caret-down" aria-hidden="true"></i></button>
                <div class="dropdown-menu">
                    <a href="/login">Login</a>
                    <a href="/register">Signup</a>
                </div>
            </div>
        </header>`;
    }

    // Main body content
    htmlTemp += `
    <div id="body">
        <div id="navbarContainer"></div>
        <div class="container">
            <!-- Back to Home -->
            <div class="back-home">
                <a href="/" class="back-link">&larr; Back to Home</a>
            </div>
            
            <!-- Post Header -->
            <div class="post1" data-post-id="${post.id}">
                <div class="post-header">
                    <h3 id="postTitle" class="post-title">${post.title}</h3>
                    <p id="postInfo" class="post-info">Posted by ${post.user} on ${post.creationDate}</p>`;

    // Add categories if they exist
    if (post.categories && post.categories.length > 0) {
        htmlTemp += `
                    <div class="category-label">
                        Categories:`;

        post.categories.forEach(category => {
            htmlTemp += `
                        <a>${category} | </a>`;
        });

        htmlTemp += `
                    </div>`;
    }

    // Post content
    htmlTemp += `
                </div>
                <!-- Post Content -->
                <div class="post-content" id="postContent">
                    ${post.content}
                </div>
            </div>
            
            <!-- Comments Section -->
            <div id="commentsSection">
                <!-- Existing Comments List -->
                <h3>Comments</h3>
                <div id="commentsList">
                    <!-- Comments will be dynamically rendered -->
                </div>
                
                <!-- Add New Comment Form -->
                <div id="addCommentContainer">
                    <h4>Leave a comment</h4>
                    <form action="/create/comment" method="post" id="commentForm">
                        <textarea id="commentContent" rows="3" placeholder="Write a comment..." required></textarea>
                        <button type="submit" id="commentSubmit">Post Comment</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    // Set the HTML content
    html.innerHTML = htmlTemp;

    // Create the dynamic script
    const container = document.getElementById("dyanamicScript");

    // Clear previous scripts
    container.innerHTML = '';

    // Create the script module element
    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';

    // Set the content of the script
    scriptModule.textContent = `
        import { CreateComments } from "/static/js/createComment.js";
        import { displayComments } from "/static/js/createComment.js";
        import { userReactions } from "/static/js/reaction.js";
        
        const userName = "${username}";
        const IdPost = "${post.id}";
        
        await displayComments(IdPost, () => userReactions(
            ".comment-item",
            "/api/comments/",
            "/comment/reaction/",
            userName,
            IdPost
        ));
        
        document.getElementById('commentForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            await CreateComments(parseInt(IdPost), () => userReactions(
                ".comment-item",
                "/api/comments/",
                "/comment/reaction/",
                userName,
                IdPost
            ));
        });
    `;

    // Append the script module to the container
    container.appendChild(scriptModule);

    // If username is not provided, add the permission denied script
    if (!username) {
        const permissionScript = document.createElement('script');
        permissionScript.src = "/static/js/permissionDenied.js";
        container.appendChild(permissionScript);
    }

    // Update stylesheets
    removeAllStylesheets();
    addStylesheet("/static/css/post.css");
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/comments.css");
    addStylesheet("/static/css/home.css");
}

function navigateTo(endpoint) {
    history.pushState(null, null, endpoint);
    LoadContent(endpoint);
}

function LoadContent(endpoint) {
    var path = new URLSearchParams(window.location.search)
    console.log(path)
    if (endpoint == "/" || !endpoint) HomeContent();
    else if (endpoint.includes("/post")) {
        console.log("test")
        id = path.get('id')
        console.log(id)
        PostContent(id)
    }
    // switch (path) {
    //     case "/": HomeContent();
    //     // case "/login": LoginContent();
    //     // case "/Signup": SignupContent();
    //     case "/Post": PostContent();
    // }
    // HomeContent()
}

document.addEventListener('click', (e) => {
    // Find closest anchor tag if the click was on a child element
    const link = e.target.closest('a');

    // Check if it's an internal link (not external)
    if (link && link.getAttribute('href').startsWith('/') && !link.getAttribute('target')) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
        console.log(link.getAttribute('href'))
    }
});

// window.addEventListener('DOMContentLoaded', (e) => {
//     e.preventDefault()
//     LoadContent(window.location.pathname)
// })
LoadContent(window.location.pathname)

