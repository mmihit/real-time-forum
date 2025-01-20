const fetchApi = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Return null to handle errors gracefully
  }
};

export const displayPosts = (UserName) => {
  let flag = true;
  let input = "";
  addEventListener('click', e => {
    let category = e.target.dataset.category
    const allPosts = e.target.id === 'All-Posts'
    const user = e.target.id === 'Post-Created'
    const likes = e.target.id == 'Likes'
    if (category || allPosts || user || likes) {
      flag = false
      if (category) {
        input = category
      } else if (user) {
        input = UserName
      }
      if (!input && (user || likes)) {
        return
      }
      loadPosts(input)
    }
    input = ""
    category = ""
  })
  if (flag) {
    loadPosts();
  }
}

export const GoToTop = () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}

const loadPosts = async (input) => {
  GoToTop()
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

  let startIndex = 0
  let endIndex = 5

  DisplayAllPosts(posts.slice(startIndex, endIndex))

  endIndex += 5

  // Display posts if available
  window.addEventListener('scroll', () => {

    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const scrolled = window.scrollY
    if (Math.ceil(scrolled) === scrollable && posts.length >= endIndex) {
      console.log(posts.length)
      console.log(endIndex)
      DisplayAllPosts(posts.slice(startIndex, endIndex))
      if (posts.length - endIndex > 0 && posts.length - endIndex < 5) {
        endIndex += posts.length - endIndex
      } else {
        endIndex += 5
      }
    }

  })

};

const FilterByCategory = (allPosts, category) => {
  return allPosts.filter(obj => obj.categories.includes(category.toLowerCase()))
}

// Function to create a post element
const CreatePost = function (post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post");
  const categoryLinks = post.categories
    .map(cat => `<a>${cat}</a>`)
    .join(" | ");
  postElement.innerHTML = `
      <div>
          <div class="headers">
              <span class="username">${post.user}</span>
              <span class="date">${post.creationDate}</span>
          </div>
          <div class="category-label">
              Categories: ${categoryLinks}
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

export const permissionDenied = (isDenied) => {
  const postBtn = document.getElementById('Post-Created')
  const likesBtn = document.getElementById('Likes')
  const createPostBtn = document.getElementById('Create-Post')

  var btns = [postBtn, likesBtn, createPostBtn]

  btns.forEach(btn => {
    if (isDenied === true) {
      btn.classList.add("none")
    } else {
      if (btn.className.includes("none")) {
        btn.classList.remove("none")
      }
    }
  });
}
