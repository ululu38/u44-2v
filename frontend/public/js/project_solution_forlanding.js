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
                            <input class="form-check-input client-group" type="checkbox" id="group${
                              index + 1
                            }" value="${group.group}" checked>
                            <label class="form-check-label d-flex justify-content-between align-items-center" for="group${
                              index + 1
                            }">
                                <span>${group.group}</span>
                                <span class="badge bg-secondary">${
                                  group.client_count
                                }</span>
                            </label>
                        </div>`
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
                                </div>`
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
      const data = await response.json();
      return data;
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
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id '${containerId}' not found`);
    }
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
      if (index % 4 === 0) {
        currentRow = document.createElement("div");
        currentRow.className = "row";
        this.container.appendChild(currentRow);
      }
      currentRow.appendChild(this.createPostCard(post));
    });
  }

  renderNoResults() {
    this.container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-muted">No posts found</h3>
            </div>`;
  }

  createPostCard(post) {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-4 col-6 mt-md-0 mb-5";

    const postUrl = `?pages=article&act=post&post=${post.post_id}`;
    const hashtags = post.hashtags
      ? post.hashtags.split(",").map((tag) => tag.trim())
      : [];

    col.innerHTML = `
            <a href="${postUrl}" class="link-nounder">
                <div class="card h-100 border-0 shadow-lg rounded hover-bg-primary">
                    <img src="${post.thumbnail_path || "#"}" 
                             class="card-img-top custom-rounded3" 
                             alt="${this.escapeHtml(post.title)}"
                             onerror="this.src='#'" loading="lazy">
                    <div class="card-body">
                        <h5 class="card-title text-truncate">${this.escapeHtml(
                          post.title
                        )}</h5>
                        <div class="d-flex justify-content-end">
                            <a href="${postUrl}"
                                    class="btn btn-primary d-flex justify-content-center align-items-center rounded-circle p-0 w5h5">
                                <span class="material-symbols-outlined" style="font-size: 24px">arrow_forward</span>
                            </a>
                        </div>
                        <div class="tag-container d-flex flex-wrap justify-content-end mt-2">
                            ${hashtags
                              .map(
                                (tag) => `
                                <span class="badge bg-secondary me-1">${this.escapeHtml(
                                  tag
                                )}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </a>`;

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
    this.renderer = new ProjectRenderer("project");
    this.currentFilters = {
      page: 1,
      limit: 12,
      categoryId: 15,
      hashtags: null,
      selectedClients: [],
    };

    this.initializeEventListeners();
    this.initializeFromURL();
  }

  initializeEventListeners() {
    document.getElementById("apply")?.addEventListener("click", () => {
      const selectedClients = Array.from(
        document.querySelectorAll(".company:checked")
      ).map((cb) => cb.value);
      this.updateFilters({ selectedClients });
    });

    document.getElementById("reset")?.addEventListener("click", () => {
      document
        .querySelectorAll(".client-group, .company")
        .forEach((cb) => (cb.checked = false));
      this.updateFilters({ selectedClients: [] });
      updateCompanies(); // Call the existing updateCompanies function
    });
  }

  initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    this.currentFilters.hashtags = params.get("hashtags") || "CCTV";
    this.loadPosts();
  }

  async updateFilters(newFilters) {
    this.currentFilters = { ...this.currentFilters, ...newFilters };
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
