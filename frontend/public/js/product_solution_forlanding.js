class PostAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;

  }

  async fetchPosts(page = 1, limit = 8, categoryId = null, hashtags = null) {
    try {
      let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      if (hashtags) {
        url += `&hashtags=${encodeURIComponent(hashtags)}`;
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

class PostRenderer {
  constructor(containerId, paginationId) {
    this.container = document.getElementById(containerId);
    this.pagination = document.getElementById(paginationId);
  }

  renderPosts(posts) {
    if (!posts || posts.length === 0) {
      this.container.innerHTML = `
          <div class="col-12 text-center py-5">
              <h3 class="text-muted">No posts found</h3>
          </div>`;
      return;
    }

    this.container.innerHTML = ""; // Clear existing content

    posts.forEach((post) => {
      const postHTML = `
<div class="col-12 col-sm-6 col-md-3 col-lg-4 mb-4">
    <a href="?pages=article&act=post&post=${post.post_id}" class="link-nounder">
        <div class="card h-100 border-0 shadow-lg rounded hover-bg-primary">
            <div class="card h-100 border-0 shadow-lg rounded hover-bg-primary">
                <img src="${post.thumbnail_path}" 
                     class="card-img-top custom-rounded3" 
                     alt="${this.escapeHtml(post.title)}" 
                     loading="lazy" 
                     style="object-fit: cover; width: 100%; height: auto; min-height: 200px; max-height: 300px;" />
                <div class="card-body">
                    <h5 class="card-title text-truncate fs-6 fs-md-5">${this.escapeHtml(post.title)}</h5>
                    <div class="d-none d-md-flex justify-content-end">
                        <a href="?pages=article&act=post&post=${post.post_id}"
                            class="btn btn-primary d-flex justify-content-center align-items-center rounded-circle p-0 w5h5">
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                    <div class="tag-container">
                        <span class="tag fs-8 fs-md-7 fs-lg-6">${this.escapeHtml(post.hashtags)}</span>
                    </div>
                </div>
            </div>
        </div>
    </a>
</div>
`;
      this.container.insertAdjacentHTML("beforeend", postHTML);
    });
  }

  renderPagination(currentPage, totalPages, onPageClick) {
    if (!this.pagination) return;

    let paginationHTML = "";

    // Previous button
    paginationHTML += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
          <a class="page-link" href="#" data-page="${currentPage - 1
      }" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
          </a>
      </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
          <li class="page-item ${currentPage === i ? "active" : ""}">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>`;
    }

    // Next button
    paginationHTML += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
          <a class="page-link" href="#" data-page="${currentPage + 1
      }" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
          </a>
      </li>`;

    this.pagination.innerHTML = paginationHTML;

    // Add click event listeners
    this.pagination.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(e.currentTarget.dataset.page);
        if (!isNaN(page) && page > 0 && page <= totalPages) {
          onPageClick(page);
        }
      });
    });
  }

  escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

class ProductManager {
  constructor() {
    this.api = new PostAPI("https://u44tech.com/services/post_get_all.php");
    this.renderer = new PostRenderer("solutions", "pagination");
    this.currentState = {
      page: 1,
      limit: this.getInitialLimit(),
      categoryId: 17,
      hashtags: "Software Development",
    };
    this.initializeEventListeners();
    this.loadPosts();
    this.initializeResizeListener();
  }

  getInitialLimit() {
    if (window.matchMedia("(max-width: 576px)").matches) {
      return 4;
    } else if (window.matchMedia("(max-width: 768px)").matches) {
      return 6;
    }
    return 8;
  }


  initializeResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newLimit = this.getInitialLimit();
        if (this.currentState.limit !== newLimit) {
          this.currentState.limit = newLimit;
          this.currentState.page = 1;
          this.loadPosts();
        }
      }, 250);
    });
  }

  initializeEventListeners() {
    document.querySelectorAll(".solution-nav-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Update active class
        document.querySelectorAll(".solution-nav-item").forEach((item) => {
          item.classList.remove("active");
        });
        e.currentTarget.classList.add("active");

        // Update hashtags and reload posts
        this.currentState.hashtags = e.currentTarget.dataset.hashtags;
        this.currentState.page = 1; // Reset to first page
        this.loadPosts();
      });
    });
  }

  async loadPosts() {
    const data = await this.api.fetchPosts(
      this.currentState.page,
      this.currentState.limit,
      this.currentState.categoryId,
      this.currentState.hashtags
    );

    this.renderer.renderPosts(data.posts);
    if (data.pagination && data.pagination.total_pages > 1) {
      this.renderer.renderPagination(
        data.pagination.current_page,
        data.pagination.total_pages,
        (page) => {
          this.currentState.page = page;
          this.loadPosts();
        }
      );
    } else {
      document.getElementById("pagination").innerHTML = "";
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ProductManager();
});
