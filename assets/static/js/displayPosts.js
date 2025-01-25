export const fetchApi = async (url) => {
  console.log(url)
  try {
    const response = await fetch(url,{
      method: 'POST', // Use POST to fetch data
      headers: {
          'Content-Type': 'application/json' // Indicate that the body is in JSON format
      },
      body: JSON.stringify({
          action: "fetchComments" // Optional: Send additional context if needed
      }) 
      });
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Return null to handle errors gracefully
  }
};

// const createScrollPagination = (posts, displayCallback) => {
//   let startIndex = 0;
//   let endIndex = 5;
//   let isLoading = false;

//   displayCallback(posts.slice(0, endIndex));

//   const handleScroll = () => {
//     if (isLoading) return;

//     const scrollable = document.documentElement.scrollHeight - window.innerHeight;
//     const scrolled = window.scrollY;

//     if (Math.ceil(scrolled) >= scrollable && posts.length > endIndex) {
//       isLoading = true;

//       startIndex = endIndex;
//       endIndex = Math.min(endIndex + 5, posts.length);

//       displayCallback(posts.slice(startIndex, endIndex), true);

//       isLoading = false;
//     }
//   };

//   // Clean up previous event listeners before adding new one
//   window.removeEventListener('scroll', handleScroll);
//   window.addEventListener('scroll', handleScroll);

//   return () => window.removeEventListener('scroll', handleScroll);
// };

// const scrollingPosts = (posts) => {
//   if (!posts || !posts.length) return;
//   return createScrollPagination(posts, DisplayAllPosts);
// };

export const getPosts = async (UserName) => {
  // GoToTop()
  // let cleanup = null;
  let currentPosts = await loadPosts();

  // Initial display
  // cleanup = scrollingPosts(currentPosts);
  const handleClick = async (e) => {
    const category = e.target.dataset.category;
    const isClickOnAllPosts = e.target.id === 'All-Posts';
    const isCLickOnMyLikes = e.target.id === 'Likes';
    const isClickOnMyPosts = e.target.id === 'Post-Created'


    if (category || isClickOnAllPosts || isClickOnMyPosts || isCLickOnMyLikes) {

      // cleanup();


      let input = '';

      if (category) {
        input = category;
      } else if (isClickOnMyPosts) {
        if (!UserName) {
          return
        }
        input = UserName
      } else if (isCLickOnMyLikes) {
        return
      }

      DisplayAllPosts(currentPosts)
      return

    }
    
  };
  DisplayAllPosts(currentPosts)
  console.log("finish")

  document.removeEventListener('click', handleClick);
  document.addEventListener('click', handleClick);

};

// export const GoToTop = () => {
//   if ('scrollRestoration' in history) {
//     history.scrollRestoration = 'manual';
//   }
//   window.scrollTo(0, 0);
// }

export const loadPosts = async (input) => {
  let apiData;
  let posts = [];
  const categories = ["sport", "games", "news", "lifestyle", "food"]

  // Determine the type of input
  const isGategory = categories.includes(input)
  const isUser = input && !isGategory;

  // Fetch data based on input type
  if (isUser) {
    apiData = await fetchApi(`/api/users/${input}`);
  } else {
    apiData = await fetchApi(`/api/posts`)
  }
  // console.log(apiData)
  // Process fetched data
  if (isUser) {
    posts = apiData?.posts || [];
  } else if (isGategory) {
    posts = FilterByCategory(apiData, input) || [];
  } else {
    posts = apiData || [];
  }
  // console.log(posts)
  return posts
};

const FilterByCategory = (allPosts, category) => {
  return allPosts.filter(obj => obj.categories.includes(category.toLowerCase()))
}

// Function to create a post element
export const RenderPosts = function (post) {
  const postElement = document.createElement("div");
  postElement.className="post";
  postElement.dataset.postId = post.id;
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
          <div class="like-div">
            <button class="btn">
              <span class="material-icons">thumb_up</span>
            </button>
            <span class="count">${post.likes || 0}</span>
          </div>
          <div class="dislike-div">
            <button class="btn">
              <span class="material-icons">thumb_down</span>
            </button>
            <span class="count">${post.dislikes || 0}</span>
          </div>
        </div>
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
  // if (!isLoadPosts) {
    postContainer.innerHTML = ""
    // console.log("clear inner html")
  // }

  posts.forEach(post => {
 
    const postElement = RenderPosts(post);
    postContainer.appendChild(postElement);
  });
};