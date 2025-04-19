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
        if (response.ok) {
            return await response.json();
        } else {
            return false
        }

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
    removeAllStylesheets();
    addStylesheet("/static/css/styles.css");
    addStylesheet("/static/css/alert.css");

    const html = document.getElementById("dynamicHtml");

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
}

async function RegisterContent() {
    removeAllStylesheets();
    addStylesheet("/static/css/styles.css");
    addStylesheet("/static/css/alert.css");

    const html = document.getElementById("dynamicHtml");

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


}

async function HomeContent() {
    removeAllStylesheets();
    addStylesheet("/static/css/home.css");
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/online_users.css")

    const homeData = await fetchApi(`/api/params/Home?_=${new Date().getTime()}`);
    const username = homeData.username;
    const html = document.getElementById("dynamicHtml");

    let htmlTemp = `     
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
      </div>;`


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



    html.innerHTML = htmlTemp;

    if (!username) {
        return true
    }
}

async function PostContent() {
    const apiData = await fetchApi("/api/params/Post");
    if (!apiData || !apiData.post) {
        console.log("hadkfjaslkdfjalksdfjlka")
        return
    }
    removeAllStylesheets();
    addStylesheet("/static/css/post.css");
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/comments.css");
    addStylesheet("/static/css/home.css");
    addStylesheet("/static/css/online_users.css");

    console.log("tttttttttttttt", apiData)
    const post = apiData.post;
    const username = apiData.username;
    const html = document.getElementById("dynamicHtml");

    let htmlTemp = `<div id="body">
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



    if (!username) {
        return true
    }

}

function MessengerContent() {
    removeAllStylesheets();
    addStylesheet("/static/css/alert.css");
    addStylesheet("/static/css/messenger.css");
    addStylesheet("/static/css/online_users.css");

    const html = document.getElementById("dynamicHtml");
    let htmlTemp = `
        <div id="body">
            <div class="container">
                <div class="back-home">
                        <a href="/" class="back-link">&larr; Back to Home</a>
                </div>
                <div class="main">
                    <div class="users-box">
                        <div class="chat-list" id="chat-list">
                        </div>
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
    scriptModule.src = "/static/js/messenger.js";
    container.appendChild(scriptModule);



    if (document.getElementById('chat-list')) {
        console.log("aaaaaaaaahna")
        lastMessagesListHnadler()
    }
}

function PageNotFound() {
    removeAllStylesheets();
    addStylesheet("/static/css/error.css");
    let tempHtml = `
        <div class="container">
            <div class="error-code">400</div>
            <div class="error-message">Page Not Found</div>
            <div class="error-actions">
                <a href="/"><button>Go to Home</button></a>
            </div>
        </div>
    `
    let ErrorSection;
    if (!document.getElementById('Error-section')) {
        console.log("not here")
        ErrorSection = document.createElement('div');
        ErrorSection.id = 'Error-section';
        document.body.appendChild(ErrorSection)
    } else {
        ErrorSection = getElementById('Error-section')
    }
    console.log(ErrorSection)

    document.getElementById('fixedHtml').style.display = "none";
    document.getElementById('dynamicHtml').style.display = "none";
    ErrorSection.innerHTML = tempHtml;


}

export function navigateTo(endpoint) {
    history.pushState(null, null, endpoint);
    LoadContent(endpoint).catch(error => console.error("Error loading content:", error));
}

async function LoadContent(endpoint) {
    // console.log(end)
    const uniqueUrl = endpoint + (endpoint.includes('?') ? '&' : '?') + '_=' + new Date().getTime();

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

    if (document.getElementById("Error-section")) document.getElementById('Error-section').remove();
    if (document.getElementById('fixedHtml')) {
        document.getElementById('fixedHtml').style.display = "block";
        // if (document.getElementById('Name'))
    };
    if (document.getElementById('dynamicHtml')) {
        document.getElementById('dynamicHtml').style.display = "block";
    }


    if (endpoint === "/" || !endpoint) {
        if (await HomeContent())
            setTimeout(applyPermissionDenied, 100);
    } else if (endpoint.includes('/post')) {
        if (await PostContent())
            setTimeout(applyPermissionDenied, 100);
    } else if (endpoint === "/login" || endpoint === "/logout") {
        console.log("tttttttttttttttttt", endpoint)
        await LoginContent();
        if (document.getElementById('fixedHtml')) document.getElementById('fixedHtml').style.display = "none";
        await insertUserInCach();
        if (window.WebSocketManager.connection) {
            window.WebSocketManager.connection.close()
        }
    } else if (endpoint === "/register") {
        await RegisterContent();
        if (document.getElementById('fixedHtml')) document.getElementById('fixedHtml').style.display = "none";
        await insertUserInCach();
        if (window.WebSocketManager.connecttion) {
            window.WebSocketManager.connection.close()
        }

    } else if (endpoint === "/messenger") {
        MessengerContent();
    } else {
        // alert("teeeeeest")
        PageNotFound();
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

function showAlert(msj) {
    const alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";
    alertBox.textContent = msj

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 5000);
}

window.showAlert = showAlert

await insertUserInCach()

LoadContent(window.location.pathname);
window.WebSocketManager.initializeOnlineUsersHandler(createOnlineUsers);
window.WebSocketManager.initializeLastMessagesListHandler(lastMessagesListHnadler);

if (window.loggedUser && window.WebSocketManager) {
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
    ;


    // Create image element
    const img = document.createElement('img');
    img.src = avatarURL;
    img.alt = user.userName;
    img.className = 'avatar';
    img.dataset.user = user.userName

    // Create status dot
    const statusDot = document.createElement('span');
    statusDot.className = `status-dot ${user.status}`;
    statusDot.dataset.user = `${user.userName}`;

    // Create username div
    const usernameDiv = document.createElement('h3');
    usernameDiv.className = 'username';
    usernameDiv.textContent = user.userName;
    usernameDiv.dataset.user = `${user.userName}`;


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

function lastMessagesListHnadler(onlineUsers) {
    const chatListElement = document.getElementById('chat-list') ? document.getElementById('chat-list') : false;
    if (chatListElement) {
        const users = !onlineUsers || onlineUsers === undefined ? window.WebSocketManager.Users : onlineUsers;
        chatListElement.innerHTML = ''
        console.log(users)
        users.forEach(user => {
            if (user.lastMessage) {
                const card = document.createElement('div');
                card.className = 'profile-card';
                card.setAttribute('data-user', user.userName);

                const avatarContainer = document.createElement('div');
                avatarContainer.className = 'avatar-container';

                const avatarName = encodeURIComponent(user.userName);
                const avatarURL = `https://ui-avatars.com/api/?name=${avatarName}&background=6c63ff&color=fff&size=150`;

                const img = document.createElement('img');
                img.src = avatarURL;
                img.alt = 'User Avatar';
                img.className = 'avatar';
                img.setAttribute('data-user', user.userName);

                const status = document.createElement('span');
                status.className = `status-indicator ${user.status}`;
                status.setAttribute('data-user', user.userName);

                avatarContainer.appendChild(img);
                avatarContainer.appendChild(status);

                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';

                const username = document.createElement('h2');
                username.className = 'username';
                username.textContent = user.userName;
                username.setAttribute('data-user', user.userName);

                const message = document.createElement('p');
                message.className = 'message';
                message.textContent = user.lastMessage;
                message.setAttribute('data-user', user.userName);

                userInfo.appendChild(username);
                userInfo.appendChild(message);

                card.appendChild(avatarContainer);
                card.appendChild(userInfo);

                chatListElement.appendChild(card)
                // console.log(card)
            }
            window.messagesListInnerHtml = document.getElementById('chat-list').innerHTML;
            console.log(window.messagesListInnerHtml)
        })
    }
}


function createOnlineUsers(users) {

    // Example: Update a sidebar with online users
    const onlineUsersElement = document.getElementById('online-users-list');
    if (onlineUsersElement) {
        onlineUsersElement.innerHTML = '';

        const onlineUsers = users === undefined ? window.WebSocketManager.Users : users
        // console.log((!undefined), window.WebSocketManager.Users)
        // console.log((!!undefined), users)
        if (onlineUsers) {
            onlineUsers.forEach(user => {
                // const userElement = document.createElement('button');
                // userElement.className = `online-user ${user.status}`;
                // userElement.textContent = user.userName;
                // userElement.dataset.user = user.userName
                // onlineUsersElement.appendChild(userElement);
                createUserProfile(user, onlineUsersElement);
                // window.messagesListInnerHtml = messagesListElement.innerHTML
            });
            // console.log(messagesListElement)
            // console.log(document.querySelectorAll('.simple-profile'))
            document.querySelectorAll('.simple-profile').forEach(element => element.addEventListener('click', goToChat))
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

function insertUserValue() {
    document.getElementById('Name').setAttribute('value', window.loggedUser)
    document.querySelector('.dropdown-button').innerHTML += " " + window.loggedUser
    if (window.WebSocketManager) {
        createOnlineUsers()
    }
}

if (document.readyState !== 'loading') insertUserValue();
window.addEventListener('DOMContentLoaded', insertUserValue)