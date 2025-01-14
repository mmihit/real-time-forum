const fetchApi = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Return null to handle errors gracefully
  }
};

const loadPosts = async (input) => {
  let apiData;
  let posts = [];
  const categories = ["sport", "games", "news", "lifestyle", "food"]

  // Determine the type of input
  const isGategory = categories.includes(input)
  const isPostId = input && !isNaN(input);
  const isUser = input && isNaN(input) && !isGategory;

  console.log(input)

  // Fetch data based on input type
  if (isPostId) {
    apiData = await fetchApi(`/api/posts/${input}`);
  } else if (isUser) {
    apiData = await fetchApi(`/api/users/${input}`);
  } else {
    apiData = await fetchApi("/api/posts");
  }

  // Process fetched data
  if (isUser) {
    posts = apiData?.posts || [];
  } else if (isPostId) {
    if (apiData) posts.push(apiData);
  } else if (isGategory) {
    posts = FilterByCategory(apiData, input) || [];
  } else {
    posts = apiData || [];
  }


  // Display posts if available

  DisplayAllPosts(posts);

};

const FilterByCategory = (allPosts, category) => {
  return allPosts.filter(obj => obj.categories.includes(category.toLowerCase()))
}

// Function to create a post element
const CreatePost = function (post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post");
  postElement.innerHTML = `
      <div>
          <div class="headers">
              <span class="username">${post.user}</span>
              <span class="date">${post.creationDate}</span>
          </div>
          <div class="title">${post.title}</div>
          <div class="content">${post.content}</div>
          <a href="/post?id=${post.id}" class="comment-link">See All Comments</a>
          <div class="reactions">
          <button class="reaction-button like-button" onclick="toggleLikeDislike('like', this)">
              <i class="fas fa-thumbs-up"></i>
          </button>
          <button class="reaction-button dislike-button" onclick="toggleLikeDislike('dislike', this)">
              <i class="fas fa-thumbs-down"></i>
          </button>

      </div>
      </div>
  `;
  return postElement;
}

// Display posts dynamically :
const DisplayAllPosts = function (posts) {
  const postContainer = document.getElementById("post-container");
  if (!postContainer) {
    console.error("post-container element not found!");
    return;
  }
  postContainer.innerHTML = ""
  posts.forEach(post => {
    const postElement = CreatePost(post);
    postContainer.appendChild(postElement);
  });
};

export { loadPosts };
