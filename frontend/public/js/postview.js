document.addEventListener("DOMContentLoaded", function () {
  const postId = new URLSearchParams(window.location.search).get("post");
  const postContent = document.getElementById("postContent");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  async function fetchPostData() {
    try {
      const response = await fetch(`services/get_view_post.php?post=${postId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        renderPost(data.post);
      } else {
        throw new Error(data.message || "Failed to load post.");
      }
    } catch (error) {
      loadingMessage.style.display = "none";
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    }
  }

  function renderPost(post) {
    document.getElementById("postTitle").textContent = post.title;
    document.getElementById("postCategories").textContent =
      post.categories || "None";
    document.getElementById("postViews").textContent = post.views;
    document.getElementById("postBody").innerHTML = post.content;

    // Format date and add GMT+7
    const dateObj = new Date(post.created_at);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);
    document.getElementById("postDate").innerHTML = `${formattedDate} GMT+7`;

    // Handle tags display
    const tagsElement = document.getElementById("postTags");
    tagsElement.textContent = post.hashtags
      ? post.hashtags.split(",").join(", ")
      : "None Tags";

    // Handle thumbnail display
    const thumbnailImage = document.getElementById("thumbnailImage");
    if (post.thumbnail_path) {
      thumbnailImage.src = post.thumbnail_path;
      thumbnailImage.style.display = "block";
    } else {
      thumbnailImage.style.display = "none";
    }

    document.getElementById("loadingMessage").style.display = "none";
    document.getElementById("postContent").style.display = "block";
  }

  fetchPostData();
});
