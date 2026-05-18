class SolutionLandingAPI {
  constructor(SolutionapiUrl) {
    this.SolutionapiUrl = SolutionapiUrl;
  }

  async fetchPosts(page = 1, limit = 8, categoryIdforSn = null) {
    try {
      let url = `${this.SolutionapiUrl}?page=${page}&limit=${limit}`;
      if (categoryIdforSn) {
        url += `&category_id=${categoryIdforSn}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        posts: [],
        pagination: {},
      };
    }
  }
}

class SolutionLandingRenderer {
  constructor(container1Id, container2Id, paginationId) {
    this.container1 = document.getElementById(container1Id);
    this.container2 = document.getElementById(container2Id);
    this.pagination = document.getElementById(paginationId);
  }

  renderStaticPosts(posts, container) {
    container.innerHTML = "";
    let rowHTML = "";
    posts.forEach((post, index) => {
      const formattedDate = this.formatDate(post.created_at);
      const isLastColumnInRow =
        (index + 1) % 4 === 0 || index === posts.length - 1;
      const columnClass = isLastColumnInRow ? "col-6" : "col-3";

      const postHTML = `
            <div class="${columnClass} mt-4">
                <div class="card h-100 border-0">
                    <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
                        <img src="${post.thumbnail_path}" class="card-img-top custom-rounded3" alt="${post.title}" loading="lazy" style="object-fit: cover; width: 100%; height: 300px;"/>
                        <div class="card-body">
                            <h5 class="card-title text-truncate">${post.title}</h5>
                            <p class="card-text text-truncate-2">${this.stripHTML(post.content)}</p>
                            <p class="card-text"><small class="text-body-secondary">${formattedDate}</small></p>
                        </div>
                    </a>
                </div>
            </div>`;

      rowHTML += postHTML;
    });

    container.insertAdjacentHTML(
      "beforeend",
      `<div class="row">${rowHTML}</div>`
    );
  }

  renderSliderPosts(posts, container) {
    container.innerHTML = `
    <div class="mt-3 row">
      <swiper-container class="mySwiper" pagination="true" pagination-clickable="true" space-between="10" slides-per-view="4">
        ${posts
          .map(
            (post) => `
            <div class="swiper-slide">
            <div class="col-3">
              <div class="card h-100 border-0" style="width: 18rem;">
                <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
                  <div class="d-flex justify-content-center align-items-center">
                    <img src="${post.thumbnail_path}" class="card-img-top custom-rounded3" alt="${post.title}" loading="lazy" style="object-fit: cover; width: 100%; height: 300px;"/>
                  </div>
                  <div class="card-body">
                    <h5 class="card-title text-truncate">${post.title}</h5>
                    <p class="card-text text-truncate-2">${this.stripHTML(post.content)}</p>
                    <p class="card-text"><small class="text-body-secondary">${this.formatDate(post.created_at)}</small></p>
                  </div>
                </a>
              </div>
              </div>
            </div>
          `
          )
          .join("")}
      </swiper-container>
      </div>
    `;
  }
  

  formatDate(dateString) {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now - createdDate;
    const seconds = Math.floor(diffInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "Asia/Bangkok",
      });
    } else if (hours > 0) {
      return `${hours} Hour ago.`;
    } else {
      return `${minutes} Minute ago.`;
    }
  }

  stripHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
}

(async () => {
  const api = new SolutionLandingAPI("https://u44tech.com/services/post_get_all.php");
  const renderer = new SolutionLandingRenderer(
    "news",
    "news-slider",
    "pagination"
  );

  // Load category 1 posts (static)
  const data1 = await api.fetchPosts(1, 3, 21);
  renderer.renderStaticPosts(data1.posts, renderer.container1);

  // Load category 2 posts (slider)
  const data2 = await api.fetchPosts(1, 8, 2);
  renderer.renderSliderPosts(data2.posts, renderer.container2);
})();
