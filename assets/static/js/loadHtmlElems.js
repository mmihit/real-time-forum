window.appRegistry = {

    eventListeners: [],



    registerEventListener: function (element, event, callback) {
        if (element) {
            element.addEventListener(event, callback);
            this.eventListeners.push({ element, event, callback });
            return callback;
        }
    },

    cleanup: function () {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, callback }) => {
            console.log('remove event', element, event)
            element.removeEventListener(event, callback);
        });
        this.eventListeners = [];

        // // Remove all stored variables
        // Object.keys(this.variables).forEach(key => {
        //     this.variables[key] = null; // Clear reference
        // });

        // this.variables = {}; // Reset object

        console.log('Registry cleaned up');
    }
};


async function insertUserInCach() {
    var UserResponse = await fetchApi("/LoggedUser")
    UserResponse ? window.loggedUser = UserResponse.message : window.loggedUser = ""
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

async function fetchApi(url) {
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
            <a alt="create post" id="create-post-btn"> + Create</a>
            <a href="/messenger" alt="create post" id="create-post-btn"> Messenger</a>
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
                <div class="card online-box">
                    <div class="online-users-list" id="online-users-list"></div>
                </div>
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
    addStylesheet("/static/css/online_users.css")

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

function MessengerContent() {
    // removeDynamicEventListeners()
    const html = document.getElementById("defaultHtml");

    let htmlTemp = `<div id="customAlert"></div>`;
    console.log(window.loggedUser)

    htmlTemp += `
        <header class="header">
            <div class="site-title">
                <i class="fas fa-comments"></i>
                <a href="/" alt="home">Forum Chat</a>
            </div>
            <div class="dropdown">
                <button class="dropdown-button"><i class="fa fa-caret-down" aria-hidden="true"></i> ${window.loggedUser}</button>
                <div class="dropdown-menu">
                    <a href="/logout" alt="logout" id="logout-btn" title="Logout">Logout</a>
                </div>
            </div>
        </header>

        <div id="body">
            // <div id="navbarContainer"></div>
            <div class="container">
                    <!-- Back to Home -->
                <div class="back-home">
                        <a href="/" class="back-link">&larr; Back to Home</a>
                </div>
                <div class="card online-box">
                    <div id="online-users-list" class="online-users-list"></div>
                </div>
                <div class="main">
                    <div class="users-box">
                        <div class="top-bar">
                            <h2>Chats</h2>
                            <span class="search-icon">🔍</span>
                        </div>
                        <div class="search-box">
                            <input type="text" id="search-user" placeholder="Search user...">
                            <span class="remove-icon">❌</span>
                        </div>
                        
                        <ul class="chat-list" id="chat-list">
                        </ul>
                    </div>
                    <div class="chat-container">
                        <div class="chat-header" id="chat-header">Select a chat</div>
                        <div class="messages" id="messages">
                            
                        </div>
                        <div class="input-group">
                            <input type="text" id="message" placeholder="Type a message..." readonly>
                            <button id="send-button">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`

    html.innerHTML = htmlTemp


    const container = document.getElementById("dyanamicScript");
    if (container) container.innerHTML = '';

    const scriptModule = document.createElement('script');
    // scriptModule.type = 'module';
    scriptModule.src = "/static/js/messenger.js";
    container.appendChild(scriptModule);



    removeAllStylesheets();
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/messenger.css");
    addStylesheet("/static/css/online_users.css")
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

    window.appRegistry.cleanup();

    if (endpoint === "/" || !endpoint) {
        if (await HomeContent())
            setTimeout(applyPermissionDenied, 100);
        if (window.WebSocketManager) {
            createOnlineUsers()
        }
    } else if (endpoint.includes("/post")) {
        if (await PostContent())
            setTimeout(applyPermissionDenied, 100);
    } else if (endpoint === "/login" || endpoint === "/logout") {
        await LoginContent();
        await insertUserInCach();
        if (window.WebSocketManager.connection.readyState === WebSocket.OPEN) {
            window.WebSocketManager.connection.close()
        }
    } else if (endpoint === "/register") {
        await RegisterContent();
        await insertUserInCach();
        if (window.WebSocketManager.connection.readyState === WebSocket.OPEN) {
            window.WebSocketManager.connection.close()
        }
    } else if (endpoint === "/messenger") {
        MessengerContent();
        if (window.WebSocketManager) {
            createOnlineUsers()
        }
    }

    console.log(endpoint, window.loggedUser)


}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href').startsWith('/') && !link.getAttribute('target')) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
    }
});

// function connect() {
//     const wsUrl = `ws://${window.location.host}/ws`;
//     window.ws = new WebSocket(wsUrl);
//     window.ws.onpen = () => { }
//     window.ws.onmessage = (event) => {
//         var chatData = JSON.parse(event.data)
//         alert(`${chatData.sender} send a message`)
//     }
//     window.ws.onclose = (e) => {
//         console.log("connection closed", e)
//     }
// }

window.addEventListener('popstate', () => {
    LoadContent(window.location.pathname);
});

await insertUserInCach()
LoadContent(window.location.pathname);
// Initialize WebSocket connection if user is logged in
if (window.loggedUser && window.WebSocketManager) {
    window.WebSocketManager.initializeOnlineUsersHandler(createOnlineUsers)
    window.WebSocketManager.connect();
}

function createUserProfile(user, onlineUsersElement) {
    // Convert name to URL-friendly format for the avatar
    const avatarName = encodeURIComponent(user.userName);
    const avatarURL = `https://ui-avatars.com/api/?name=${avatarName}&background=6c63ff&color=fff&size=150`;
  
    // Create main container
    const profileDiv = document.createElement('div');
    profileDiv.className = 'simple-profile';
  
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
  
    // Create image element
    const img = document.createElement('img');
    img.src = avatarURL;
    img.alt = user.userName;
    img.className = 'avatar';
  
    // Create status dot
    const statusDot = document.createElement('span');
    statusDot.className = `status-dot ${user.status}`;
  
    // Create username div
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'username';
    usernameDiv.textContent = user.userName;
    usernameDiv.dataset.user = user.userName;
  
    // Assemble elements
    imageContainer.appendChild(img);
    imageContainer.appendChild(statusDot);
    profileDiv.appendChild(imageContainer);
    profileDiv.appendChild(usernameDiv);
  
    // Add to body (or any container)
    onlineUsersElement.appendChild(profileDiv);
  }
  
  // Example usage
//   createUserProfile("Alice Smith", true);
//   createUserProfile("John Doe", false);
  

function createOnlineUsers(users) {

    // Example: Update a sidebar with online users
    const onlineUsersElement = document.getElementById('online-users-list');
    if (onlineUsersElement) {
        onlineUsersElement.innerHTML = '';
        const onlineUsers = (users === undefined) ? window.WebSocketManager.Users : users
        console.log((!undefined), window.WebSocketManager.Users)
        console.log((!!undefined), users)
        if (onlineUsers) {
            onlineUsers.forEach(user => {
                // const userElement = document.createElement('button');
                // userElement.className = `online-user ${user.status}`;
                // userElement.textContent = user.userName;
                // userElement.dataset.user = user.userName
                // onlineUsersElement.appendChild(userElement);
                createUserProfile(user, onlineUsersElement);
            });
            onlineUsersElement.childNodes.forEach(element => element.addEventListener('click', goToChat))
        } else {
            onlineUsersElement.innerHTML = ''
        }
    }
}

function goToChat(e) {
    if (window.location.pathname != "/messenger") navigateTo("/messenger");
    setTimeout(() => {
        window.selectChatFromOnlineUsers.initializeElement(e)
        window.selectChatFromOnlineUsers.goToChat()
    }, 500)
}

// // Add this script element to include the WebSocketManager
// const scriptElement = document.createElement('script');
// scriptElement.src = "static/js/ws-manager.js"; // Save the first artifact as this file
// document.head.appendChild(scriptElement);