function removeDynamicEventListeners() {
    const defaultHtml = document.getElementById("defaultHtml");
    if (defaultHtml) {

        const newDefaultHtml = document.createElement("div");
        newDefaultHtml.id = "defaultHtml";
        defaultHtml.parentNode.replaceChild(newDefaultHtml, defaultHtml);
    }

    const dynamicScript = document.getElementById("dyanamicScript");
    if (dynamicScript) {
        const newDynamicScript = document.createElement("div");
        newDynamicScript.id = "dyanamicScript";
        dynamicScript.parentNode.replaceChild(newDynamicScript, dynamicScript);
    }

}

function applyPermissionDenied() {
    const btns = [
        document.getElementById('Post-Created'),
        document.getElementById('Likes'),
        document.getElementById('Create-Post'),
        document.getElementById('commentSubmit'),
        document.getElementById('commentContent')
    ];

    btns.forEach(btn => {
        if (btn) {
            btn.classList.add('Permission-Denied');
            btn.setAttribute('readonly', true);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }
    });
}

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

async function LoginContent() {
    const html = document.getElementById("defaultHtml");

    const htmlTemp = `
    <div id="body">
        <div id="customAlert"></div>
        <div class="container">
            <h1>Sign In</h1>
            <p>Welcome back! Register to access the Forum Chat platform.</p>

            <br>
                <form id="loginForm">
                <input type="text" id="email" name="email" placeholder="Email" required>
                <span id="emailError" class="error"></span>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <span id="passwordError" class="error"></span>

                <span id="Error" class="error"></span>
                <button type="submit" class="submit-btn">Continue</button>
            </form>
            <div class="footer">
                <a href="/">Home</a>
                <a href="/register">Sign Up</a>
            </div>
        </div>
    </div>`;

    html.innerHTML = htmlTemp;

    const container = document.getElementById("dyanamicScript");
    if (container) container.innerHTML = '';

    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';
    scriptModule.src = "/static/js/login.js";
    container.appendChild(scriptModule);

    removeAllStylesheets();
    addStylesheet("/static/css/styles.css");
    addStylesheet("/static/css/alert.css");
}

async function RegisterContent() {
    const html = document.getElementById("defaultHtml");

    const htmlTemp = `
    <div id="body">
        <div id="customAlert"></div>
        <div class="container">
            <h1>Sign Up</h1>
            <p>Welcome back! Register to access the Forum Chat platform.</p>
        <form id="registerForm">

            <!-- Nickname -->
            <input type="text" id="nickname" name="nickname" placeholder="Nickname" required>
            <span id="nicknameError" class="error"></span>

            <!-- Age -->
            <input type="number" id="age" name="age" placeholder="Age" required min="1">
            <span id="ageError" class="error"></span>

            <!-- Gender -->
            <select id="gender" name="gender" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
            <span id="genderError" class="error"></span>

            <!-- First Name -->
            <input type="text" id="firstName" name="firstName" placeholder="First Name" required>
            <span id="firstNameError" class="error"></span>

            <!-- Last Name -->
            <input type="text" id="lastName" name="lastName" placeholder="Last Name" required>
            <span id="lastNameError" class="error"></span>

            <!-- E-mail -->
            <input type="email" id="email" name="email" placeholder="E-mail" required>
            <span id="emailError" class="error"></span>

            <!-- Password -->
            <input type="password" id="password" name="password" placeholder="Password" required minlength="6">
            <span id="passwordError" class="error"></span>

            <!-- Error Message -->
            <span id="Error" class="error last-error"></span>

            <!-- Submit Button -->
            <button type="submit">Continue</button>
        </form>
            <div class="footer">
                <a href="/">Home</a>
                <a href="/login">Sign In</a>
            </div>
        </div>
    </div>`;

    html.innerHTML = htmlTemp;

    const container = document.getElementById("dyanamicScript");
    if (container) container.innerHTML = '';

    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';
    scriptModule.src = "/static/js/register.js";
    container.appendChild(scriptModule);

    removeAllStylesheets();
    addStylesheet("/static/css/styles.css");
    addStylesheet("/static/css/alert.css");
}

async function HomeContent() {
    const homeData = await fetchApi(`/api/params/Home?_=${new Date().getTime()}`);
    const username = homeData.username;
    const html = document.getElementById("defaultHtml");

    let htmlTemp = `  
      <div id="customAlert"></div>
      <!-- Header -->
      <header class="header">
        <div class="site-title">
          <i class="fas fa-comments"></i>
          <a href="/" alt="home">Forum Chat</a>
        </div>
        <div class="dropdown">
          <input type="hidden" id="Name" value="${username}">`;

    if (username) {
        htmlTemp += `      
          <button class="dropdown-button">${username} <i class="fa fa-caret-down" aria-hidden="true"></i></button>
          <div class="dropdown-menu">
            <a href="/logout" alt="logout" id="logout-btn" title="Logout">Logout</a>
            <a href="/posts/create" alt="create post" id="create-post-btn"> + Create</a>
          </div>`;
    } else {
        htmlTemp += `      
          <button class="dropdown-button">Account <i class="fa fa-caret-down" aria-hidden="true"></i></button>
          <div class="dropdown-menu">
            <a href="/login">Login</a>
            <a href="/register">Signup</a>
          </div>`;
    }

    htmlTemp += `    
        </div>
      </header>
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
      </div>`;

    const container = document.getElementById("dyanamicScript");
    if (container) container.innerHTML = '';

    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';
    scriptModule.textContent = `
          import { getPosts } from "/static/js/displayPosts.js";
          import { userReactions } from "/static/js/reaction.js";
          import { createPosts } from "/static/js/createPost.js";
          
          const UserName = "${username}";
          await getPosts(UserName, () => userReactions(".post", "/api/posts/", "/post/reaction/", UserName));
          await createPosts(UserName, () => getPosts(UserName, () => userReactions(".post", "/api/posts/", "/post/reaction/", UserName)));
    `;
    container.appendChild(scriptModule);

    removeAllStylesheets();
    addStylesheet("/static/css/home.css");
    addStylesheet("/static/css/alert.css");

    html.innerHTML = htmlTemp;

    if (!username) {
        return true
    }
}

async function PostContent() {
    const apiData = await fetchApi("/api/params/Post");
    const post = apiData.post;
    const username = apiData.username;
    const html = document.getElementById("defaultHtml");

    let htmlTemp = `<div id="customAlert"></div>`;
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

    if (post.categories && post.categories.length > 0) {
        htmlTemp += `<div class="category-label">Categories:`;
        post.categories.forEach(category => {
            htmlTemp += `<a>${category} | </a>`;
        });
        htmlTemp += `</div>`;
    }

    htmlTemp += `
                </div>
                <!-- Post Content -->
                <div class="post-content" id="postContent">
                    ${post.content}
                </div>
            </div>
            <!-- Comments Section -->
            <div id="commentsSection">
                <h3>Comments</h3>
                <div id="commentsList"></div>
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

    html.innerHTML = htmlTemp;

    const container = document.getElementById("dyanamicScript");
    if (container) container.innerHTML = '';

    const scriptModule = document.createElement('script');
    scriptModule.type = 'module';
    scriptModule.textContent = `
        import { CreateComments, displayComments } from "/static/js/createComment.js";
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
    container.appendChild(scriptModule);

    removeAllStylesheets();
    addStylesheet("/static/css/post.css");
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/comments.css");
    addStylesheet("/static/css/home.css");

    if (!username) {
        return true
    }

}

export function navigateTo(endpoint) {
    history.pushState(null, null, endpoint);
    LoadContent(endpoint).catch(error => console.error("Error loading content:", error));
}

async function LoadContent(endpoint) {
    const uniqueUrl = endpoint + (endpoint.includes('?') ? '&' : '?') + '_=' + new Date().getTime();
    console.log("url", uniqueUrl);

    try {
        await fetch(uniqueUrl, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            cache: "no-cache"
        });
    } catch (error) {
        console.error("Error fetching endpoint:", error);
    }

    removeDynamicEventListeners();

    if (endpoint === "/" || !endpoint) {
        if (await HomeContent())
            setTimeout(applyPermissionDenied, 100);
    } else if (endpoint.includes("/post")) {
        if (await PostContent())
            setTimeout(applyPermissionDenied, 100);
    } else if (endpoint === "/login" || endpoint === "/logout") {
        await LoginContent();
    } else if (endpoint === "/register") {
        await RegisterContent();
    }
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href').startsWith('/') && !link.getAttribute('target')) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
    }
});

LoadContent(window.location.pathname);
