const fetchApi = async (url) => {
  try {
    let req = await fetch(url);
    let jsonData = await req.json();
    return jsonData;
  } catch (error) {
    console.log("Error Fetching data ", error);
  }
};

let postsContainer = document.createElement("div");
postsContainer.className = "posts-container";

const loadPosts = async (input) => {
  let apiData;
  let user = false;
  let postId = false;
  let posts = [];

  if (input && !isNaN(input)) postId = true;
  else if (input && isNaN(input)) user = true;

  if (postId) apiData = await fetchApi(`/api/posts/${input}`);
  if (user) apiData = await fetchApi(`/api/users/${input}`);
  else if (!user && !postId) apiData = await fetchApi("/api/posts");

  if (user) posts = apiData.posts;
  else if (postId) posts.push(apiData);
  else if (!user && !postId) posts = apiData;

  if (posts) {
    displayPosts(posts);
  }
};

const displayPosts = (posts) => {
  posts.forEach((post) => {
    let postDiv = document.createElement("div");
    postDiv.className = "post";
    let userDiv = document.createElement("div");
    userDiv.className = "user";
    let userNameDiv = document.createElement("div");
    userNameDiv.className = "user-name";
    let userInfoDiv = document.createElement("div");
    userInfoDiv.className = ".info";
    userNameDiv.textContent = post.user;
    let userImg = document.createElement("img");
    userImg.className = "user-img";
    userImg.src =
      "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg";
    let creationDateDiv = document.createElement("div");
    creationDateDiv.className = "creation-date";
    creationDateDiv.textContent = post.creationDate;
    userInfoDiv.append(userNameDiv, creationDateDiv);
    userDiv.append(userImg, userInfoDiv);
    let titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.textContent = post.title;
    let contentDiv = document.createElement("div");
    contentDiv.className = "content";
    contentDiv.textContent = post.content;
    let commentContainerDiv = document.createElement("div");
    commentContainerDiv.className = "comment-area";
    let commentInput = document.createElement("textarea");
    commentInput.className = "comment-input";
    commentContainerDiv.appendChild(commentInput);
    postDiv.append(userDiv, titleDiv, contentDiv, commentContainerDiv);
    let postLink = document.createElement("a");
    postLink.href = `/posts/${post.id}`;
    postLink.appendChild(postDiv);
    postsContainer.appendChild(postLink);
  });
};

document.body.appendChild(postsContainer);

export { loadPosts };
