async function initializeClientGroups() {
  try {
    const response = await fetch("https://u44tech.com/services/get_client_groups.php");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    const clientsContainer = document.querySelector(
      "#clientsCollapse .card_drop-body"
    );

    if (result.status === "success") {
      clientsContainer.innerHTML = result.data
        .map(
          (group, index) => `
                        <div class="form-check">
                            <input class="form-check-input client-group" type="checkbox" id="group${index + 1
            }" value="${group.group}" checked>
                            <label class="form-check-label d-flex justify-content-between align-items-center" for="group${index + 1
            }">
                                <span>${group.group}</span>
                                <span class="badge bg-secondary">${group.client_count
            }</span>
                            </label>
                        </div>
                    `
        )
        .join("");
      document
        .querySelectorAll(".client-group")
        .forEach((checkbox) =>
          checkbox.addEventListener("change", updateCompanies)
        );
      updateCompanies();
    } else {
      throw new Error("Failed to load client groups");
    }
  } catch (error) {
    console.error(error);
    const clientsContainer = document.querySelector(
      "#clientsCollapse .card_drop-body"
    );
    clientsContainer.innerHTML = `<div class="alert alert-danger">Failed to load client groups. Please try again later.</div>`;
  }
}

async function updateCompanies() {
  const selectedGroups = Array.from(
    document.querySelectorAll(".client-group:checked")
  ).map((cb) => cb.value);
  try {
    const response = await fetch("https://u44tech.com/services/get_companies.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedGroups),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    const companiesContainer = document.querySelector(
      "#companyCollapse .card_drop-body"
    );

    if (result.status === "success") {
      companiesContainer.innerHTML = result.data.length
        ? result.data
          .map(
            (company) => `
                                <div class="form-check">
                                    <input class="form-check-input company" type="checkbox" id="company-${company.id}" value="${company.id}">
                                    <label class="form-check-label d-flex justify-content-between align-items-center" for="company-${company.id}">
                                        <span>${company.name}</span>
                                        <span class="badge bg-secondary">${company.count}</span>
                                    </label>
                                </div>
                            `
          )
          .join("")
        : '<div class="text-muted">ไม่พบข้อมูลบริษัทในกลุ่มที่เลือก</div>';
    } else {
      throw new Error("Failed to load companies");
    }
  } catch (error) {
    console.error(error);
    const companiesContainer = document.querySelector(
      "#companyCollapse .card_drop-body"
    );
    companiesContainer.innerHTML = `<div class="alert alert-danger">Failed to load companies. Please try again later.</div>`;
  }
}

document.getElementById("apply").addEventListener("click", () => {
  const selectedCompanies = Array.from(
    document.querySelectorAll(".company:checked")
  ).map((cb) => cb.value);
  // console.log('Selected Companies:', selectedCompanies);
});

document.getElementById("reset").addEventListener("click", () => {
  document
    .querySelectorAll(".client-group, .company")
    .forEach((cb) => (cb.checked = false));
  updateCompanies();
});

document.addEventListener("DOMContentLoaded", initializeClientGroups);

class ProjectAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchPosts(
    page = 1,
    limit = 8,
    categoryId = null,
    hashtags = null,
    selectedClients = null
  ) {
    try {
      let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
      if (categoryId) url += `&category_id=${categoryId}`;
      if (hashtags) url += `&hashtags=${encodeURIComponent(hashtags)}`;
      if (selectedClients?.length)
        url += `&select=${selectedClients.join(",")}`;

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        posts: [],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_posts: 0,
          limit: limit,
        },
      };
    }
  }
}

class ProjectRenderer {
  constructor(containerId, paginationId) {
    this.container = document.getElementById(containerId);
    this.pagination = document.getElementById(paginationId);
    // if (!this.container) {
    //   console.error(`Container with id '${containerId}' not found`);
    // }
    // if (!this.pagination) {
    //   console.error(`Pagination container with id '${paginationId}' not found`);
    // }
  }

  renderPosts(posts) {
    if (!this.container) return;

    this.container.innerHTML = "";
    if (!posts.length) {
      this.renderNoResults();
      return;
    }

    let currentRow;
    posts.forEach((post, index) => {
      // Calculate posts per row based on screen width
      let postsPerRow;
      if (window.innerWidth >= 992) { // lg and up
        postsPerRow = 4; // col-lg-3
      } else if (window.innerWidth >= 768) { // md
        postsPerRow = 3; // col-md-4
      } else if (window.innerWidth >= 576) { // sm
        postsPerRow = 2; // col-sm-6
      } else { // xs
        postsPerRow = 1; // col-12
      }

      if (index % postsPerRow === 0) {
        currentRow = document.createElement("div");
        currentRow.className = "row";
        this.container.appendChild(currentRow);
      }
      currentRow.appendChild(this.createPostCard(post));
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


  renderNoResults() {
    this.container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-muted">No posts found</h3>
            </div>
        `;
  }

  createPostCard(post) {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    const postUrl = `?pages=article&act=post&post=${post.post_id}`;
    const hashtags = post.hashtags
      ? post.hashtags.split(",").map((tag) => tag.trim())
      : [];

    col.innerHTML = `
 <a href="${postUrl}" class="link-nounder">
    <div class="card h-100 border-0 shadow-lg rounded hover-bg-primary">

        <img src="${post.thumbnail_path || 'https://placehold.co/220x220'}" class="card-img-top custom-rounded3 img-fluid"
            alt="${this.escapeHtml(post.title)}" onerror="this.src='https://placehold.co/220x220'" loading="lazy"
            style="object-fit: cover; width: 100%; height: auto;">

        <div class="card-body">

            <h5 class="card-title" style="font-size: clamp(0.875rem, 2vw, 1rem);">
                ${this.escapeHtml(post.title)}
            </h5>

            <div class="d-none d-md-flex justify-content-end">
                <a href="${postUrl}"
                    class="btn btn-primary d-flex justify-content-center align-items-center rounded-circle p-0"
                    style="width: clamp(2.5rem, 4vw, 3rem); height: clamp(2.5rem, 4vw, 3rem);">
                    <span class="material-symbols-outlined"
                        style="font-size: clamp(20px, 2vw, 24px)">arrow_forward</span>
                </a>
            </div>

            <div class="tag-container d-flex flex-wrap justify-content-end gap-2 mt-3">
                ${hashtags
        .map(tag => `
                <span class="badge bg-secondary">${this.escapeHtml(tag)}</span>
                `)
        .join("")}
            </div>
        </div>
    </div>
</a>
        `;

    return col;
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

class ProjectManager {
  constructor() {
    this.api = new ProjectAPI("https://u44tech.com/services/post_get_all.php");
    this.renderer = new ProjectRenderer("project", "pagination");
    this.currentFilters = {
      page: 1,
      limit: this.getInitialLimit(),
      categoryId: 15,
      hashtags: "", // Default value
      selectedClients: [],
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
        if (this.currentFilters.limit !== newLimit) {
          this.currentFilters.limit = newLimit;
          this.currentFilters.page = 1;
          this.loadPosts();
        }
      }, 250);
    });
  }

  initializeEventListeners() {
    // Apply button event listener
    document.getElementById("apply")?.addEventListener("click", () => {
      const selectedClients = Array.from(
        document.querySelectorAll(".company:checked")
      ).map((cb) => cb.value);
      this.updateFilters({
        selectedClients,
        page: 1, // Reset to first page when applying filters
      });
    });

    // Reset button event listener
    document.getElementById("reset")?.addEventListener("click", () => {
      document
        .querySelectorAll(".client-group, .company")
        .forEach((cb) => (cb.checked = false));
      this.updateFilters({
        selectedClients: [],
        page: 1, // Reset to first page when resetting
      });
      updateCompanies();
    });

    // Solution nav event listeners
    document.querySelectorAll(".solution-nav-item").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        // Remove active class from all links
        document.querySelectorAll(".solution-nav-item").forEach((item) => {
          item.classList.remove("active");
        });

        // Add active class to clicked link
        event.currentTarget.classList.add("active");

        const hashtags = event.currentTarget.getAttribute("data-hashtags");
        this.updateFilters({
          hashtags,
          page: 1, // Reset to first page when changing hashtags
        });
      });
    });
  }

  async updateFilters(newFilters) {
    this.currentFilters = {
      ...this.currentFilters,
      ...newFilters,
    };
    await this.loadPosts();
  }

  async loadPosts() {
    try {
      const data = await this.api.fetchPosts(
        this.currentFilters.page,
        this.currentFilters.limit,
        this.currentFilters.categoryId,
        this.currentFilters.hashtags,
        this.currentFilters.selectedClients
      );

      this.renderer.renderPosts(data.posts);

      // Render pagination if data is available
      if (data.pagination && data.pagination.total_pages > 1) {
        this.renderer.renderPagination(
          data.pagination.current_page,
          data.pagination.total_pages,
          (page) => {
            this.currentFilters.page = page;
            this.loadPosts();
          }
        );
      } else {
        // Clear pagination if not needed
        if (this.renderer.pagination) {
          this.renderer.pagination.innerHTML = "";
        }
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      this.renderer.renderNoResults();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ProjectManager();
});
