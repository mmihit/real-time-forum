import { fetchApi } from "/static/js/displayPosts.js";

// userReactions adds like and dislike functionality for the provided element
const userReactions = (element, getUrl, postUrl, userName) => {
  document.querySelectorAll(element).forEach(async (elementDiv) => {
    console.log("ele", elementDiv);
    const likeDiv = elementDiv.querySelector(".like-div");
    const dislikeDiv = elementDiv.querySelector(".dislike-div");
    const likeBtn = elementDiv.querySelector(".like-div .btn");
    const dislikeBtn = elementDiv.querySelector(".dislike-div .btn");
    const likeCountDisplay = elementDiv.querySelector(".like-div .count");
    const dislikeCountDisplay = elementDiv.querySelector(".dislike-div .count");
    // console.log(likeDiv)
    // const currentPost = likeDiv.closest(".post");
    // console.log(currentPost)
    const postId = document.querySelector(".post1").dataset.postid;
    let elementObject = await fetchApi(getUrl + postId);
    let commentId = null;
    let reaction = null;

    if (element == ".comment-item") {
      const currentComment = likeDiv.closest(".comment-item");
      commentId = currentComment.dataset.commentId;
      let postComments = await fetchApi(getUrl + postId);
      elementObject =postComments[Math.max(0, postComments.length - parseInt(commentId))];
    }

    let likeCount = elementObject.likes || 0;
    let dislikeCount = elementObject.dislikes || 0;
    likeCountDisplay.textContent = likeCount;
    dislikeCountDisplay.textContent = dislikeCount;

    if (!userName) {
      likeBtn.disabled = true;
      likeDiv.classList.remove("active");
      dislikeBtn.disabled = true;
      dislikeDiv.classList.remove("active");
    } else {
      likeDiv.classList.add("active");
      dislikeDiv.classList.add("active");
    }

    const userReaction = hasUserReacted(elementObject, userName);

    if (userReaction !== "") {
      if (userReaction === "dislike") {
        dislikeDiv.classList.add("selected");
        reaction = "dislike";
      } else if (userReaction === "like") {
        likeDiv.classList.add("selected");
        reaction = "like";
      }
    }

    console.log(likeBtn)

    likeBtn.addEventListener("click", async () => {
      if (reaction === "like") {
        likeDiv.classList.add("selected");
        reaction = "unlike";
        likeDiv.classList.remove("selected");
        likeCount = Math.max(0, likeCount - 1);
      } else {
        if (reaction === "dislike") {
          dislikeDiv.classList.remove("selected");
          dislikeCount = Math.max(0, dislikeCount - 1);
        }
        likeDiv.classList.add("selected");
        reaction = "like";
        likeCount++;
      }
      likeCountDisplay.textContent = likeCount;
      dislikeCountDisplay.textContent = dislikeCount;
      await fetchRequest(postUrl + postId, { postId, reaction, commentId });
    });

    dislikeBtn.addEventListener("click", async () => {
      if (reaction === "dislike") {
        reaction = "undislike";
        dislikeDiv.classList.remove("selected");
        dislikeCount = Math.max(0, dislikeCount - 1);
      } else {
        if (reaction === "like") {
          likeDiv.classList.remove("selected");
          likeCount = Math.max(0, likeCount - 1);
        }
        dislikeDiv.classList.add("selected");
        reaction = "dislike";
        dislikeCount++;
      }
      likeCountDisplay.textContent = likeCount;
      dislikeCountDisplay.textContent = dislikeCount;
      await fetchRequest(postUrl + postId, { postId, reaction, commentId });
    });
  });
};

// fetchRequest makes a request to a provided endpoint with a specific body
const fetchRequest = async (url, body) => {
  console.log(url)
  console.log(body)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error("Network response was not ok: " + res.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// hasUserReacted checks if a user has already reacted to the post
const hasUserReacted = (element, userName) => {
  return element.reactions
    ? userName in element.reactions
      ? element.reactions[userName]
      : ""
    : null;
};

export { userReactions };
