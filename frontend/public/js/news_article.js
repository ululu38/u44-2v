class PostAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchPosts(categoryId = null) {
    try {
      const url = categoryId
        ? `${this.apiUrl}?category_id=${categoryId}`
        : this.apiUrl;
      const response = await fetch(url);
      const data = await response.json();

      return data.posts.filter((post) => post.status === "published");
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }
}

class PostRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  // Inside the PostRenderer class, update the renderPosts method
  renderPosts(posts, limit = 8) {
    this.container.innerHTML = "";
    posts.slice(0, limit).forEach((post) => {
      const createdDate = new Date(post.created_at);
      const now = new Date();
      const diffInMilliseconds = now - createdDate;
      const seconds = Math.floor(diffInMilliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let formattedDate;
      if (days > 0) {
        formattedDate = createdDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZone: "Asia/Bangkok",
        });
      } else if (hours > 0) {
        formattedDate = `${hours} Hour ago.`;
      } else {
        formattedDate = `${minutes} Minute ago.`;
      }

      const postHTML = `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mt-4">
      <div class="card h-100 border-0">
        <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
          <img src="${post.thumbnail_path}" class="card-img-top custom-rounded3" alt="${post.title}"
            style="object-fit: cover; width: 100%; height: 300px;" loading="lazy"/>
          <div class="card-body">
            <h5 class="card-title text-truncate">${post.title}</h5>
            <p class="card-text text-truncate-2">${this.stripHTML(post.content)}</p>
            <p class="card-text"><small class="text-body-secondary">${formattedDate}</small></p>
          </div>
        </a>
      </div>
    </div>`;
      this.container.insertAdjacentHTML("beforeend", postHTML);
    });
  }

  getHotTopicHTML(post) {
    return `
<swiper-slide>
    <div class="col-12">
        <div class="mt-2 p-3 border custom-rounded">
            <div class="row g-0">
                <div class="col-12 col-md-7">
                    <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
                        <div class="p-3">
                            <h1 class="fw-bold h2">${post.title}</h1>
                            <div class="d-none d-md-block">
                                <p class="text-truncate-5">${this.stripHTML(post.content)}</p>
                            </div>
                            <a href="?pages=article&act=post&post=${post.post_id}"
                                class="link-nounder d-none d-md-block">
                                <button class="btn btn-default btn-lg custom-rounded3 d-flex align-items-center">
                                    <span class="material-symbols-outlined me-2">
                                        arrow_circle_right
                                    </span> Read More
                                </button>
                            </a>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-md-5 mt-3 mt-md-0">
                    <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
                        <img src="${post.thumbnail_path}" class="custom-rounded" alt="${post.title}"
                            style="width:100%; height: 300px; object-fit: cover;" loading="lazy" />
                    </a>
                </div>
            </div>
        </div>
    </div>
</swiper-slide>
    `;
  }


  renderHotTopic(post) {
    this.container.insertAdjacentHTML("beforeend", this.getHotTopicHTML(post));
  }
  stripHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
}



(async () => {
  const api = new PostAPI("https://u44tech.com/services/post_get_all.php");

  // Render Hot Topic
  const hotTopicRenderer = new PostRenderer("hot-topic");
  const allPosts = await api.fetchPosts(2);
  const topThreeHotTopics = allPosts.sort((a, b) => b.views - a.views).slice(0, 3);
  hotTopicRenderer.container.innerHTML = ""; // Clear the container before rendering
  topThreeHotTopics.forEach((post) => {
    hotTopicRenderer.container.insertAdjacentHTML("beforeend", hotTopicRenderer.getHotTopicHTML(post));
  });


  // Render Latest News (category_id = 2)
  const latestNewsRenderer = new PostRenderer("latest-news");
  const latestNews = await api.fetchPosts(2);
  latestNewsRenderer.renderPosts(latestNews);

  // Render Solutions (category_id = 1)
  const solutionsRenderer = new PostRenderer("solutions");
  const solutions = await api.fetchPosts(1);
  solutionsRenderer.renderPosts(solutions);

  // Render Solutions (category_id = 21)
  const movementRenderer = new PostRenderer("movement");
  const movement = await api.fetchPosts(21);
  movementRenderer.renderPosts(movement);
})();
