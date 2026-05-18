class PostAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchPosts(page = 1, limit = 8, categoryId = null) {
    try {
      let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
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
    this.container.innerHTML = "";
    posts.forEach((post) => {
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
            <img src="${post.thumbnail_path}" 
               class="card-img-top custom-rounded3" 
               alt="${post.title}"
               style="object-fit: cover; width: 100%; height: 300px;" 
               loading="lazy" />
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
    let isMouseOver = false;

    document.querySelectorAll(".col-3-extra").forEach((col, index, allCols) => {
      let hoverTimeout = null;

      col.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout); // ยกเลิก timeout หากมีการวางเมาส์ซ้ำ
        const totalCols = allCols.length;
        const rowIndex = Math.floor(index / 4); // หา row index
        const columnIndex = index % 4; // หา column index ใน row

        allCols.forEach((otherCol, otherIndex) => {
          const otherRowIndex = Math.floor(otherIndex / 4); // แถวของคอลัมน์อื่น
          const otherColumnIndex = otherIndex % 4; // คอลัมน์ในแถวของคอลัมน์อื่น

          // รีเซ็ตทุกคอลัมน์ก่อน
          otherCol.classList.remove("hide-left", "hide-right");

          if (rowIndex === otherRowIndex) {
            if (columnIndex >= 0 && columnIndex <= 2) {
              // คอลัมน์ที่ 1-3 ซ่อนคอลัมน์ที่ 4
              if (otherColumnIndex === 3) {
                otherCol.classList.add("hide-right");
              }
            } else if (columnIndex === 3) {
              if (otherColumnIndex === 0) {
                otherCol.classList.add("hide-left");
              }
            } else {
              // กรณีอื่น (สามารถเพิ่มเงื่อนไขเพิ่มเติมหากต้องการ)
            }
          }
        });
      });

      col.addEventListener("mouseleave", () => {
        // ตั้งค่า timeout ให้รีเซ็ตหลังจาก 3 วินาที
        hoverTimeout = setTimeout(() => {
          allCols.forEach((otherCol) => {
            otherCol.classList.remove("hide-left", "hide-right");
          });
        }, 3000); // 3 วินาที
      });
    });
  }

  renderPagination(currentPage, totalPages, onPageChange) {
    this.pagination.innerHTML = "";

    const prevClass = currentPage === 1 ? "disabled" : "";
    this.pagination.insertAdjacentHTML(
      "beforeend",
      `<li class="page-item ${prevClass}">
        <a class="page-link btn btn-primary rounded-pill d-flex align-items-center text-white link-nounder" href="#" aria-label="Previous" data-page="${
          currentPage - 1
        }">
            <span class="material-symbols-outlined me-2" aria-hidden="true">arrow_back</span>
            <div>Prev</div>
        </a>
    </li>`
    );
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i !== currentPage) continue; // Skip other pages for dot pagination
      const activeClass = i === currentPage ? "active" : "";
      this.pagination.insertAdjacentHTML(
        "beforeend",
        `<li class="page-item ${activeClass}">
            <a class="page-link rounded-pill text-white link-nounder" href="#" data-page="${i}">${i}</a>
        </li>`
      );
    }

    const nextClass = currentPage === totalPages ? "disabled" : "";
    this.pagination.insertAdjacentHTML(
      "beforeend",
      `<li class="page-item ${nextClass}">
        <a class="page-link btn btn-primary rounded-pill d-flex align-items-center text-white link-nounder" href="#" aria-label="Next" data-page="${
          currentPage + 1
        }">
            <div>Next</div>
            <span class="material-symbols-outlined ms-2" aria-hidden="true">arrow_forward</span>
        </a>
    </li>`
    );

    this.pagination.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const page = parseInt(event.target.dataset.page, 10);
        if (!isNaN(page) && onPageChange) {
          onPageChange(page);
        }
      });
    });
  }
  stripHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
}

(async () => {
  const api = new PostAPI("https://u44tech.com/services/post_get_all.php");
  const renderer = new PostRenderer("solutions", "pagination");

  let currentPage = 1;
  const limit = 20;
  const categoryId = 1;

  async function loadPosts(page) {
    const data = await api.fetchPosts(page, limit, categoryId);

    // Render posts
    renderer.renderPosts(data.posts);

    if (data.pagination.total_posts > limit) {
      renderer.renderPagination(
        data.pagination.current_page,
        data.pagination.total_pages,
        loadPosts
      );
    } else {
      // Clear pagination if not needed
      renderer.pagination.innerHTML = "";
    }
  }

  // Initial load
  loadPosts(currentPage);
})();
