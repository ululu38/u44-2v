class SwiperLandingPageAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchPosts(page = 1, limit = 9, categoryId = null) {
    try {
      let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }
}

class SwiperLandingPostRenderer {
  constructor(containerClass) {
    this.container = document.querySelector(`.${containerClass} .swiper-wrapper`);
    this.swiperContainer = document.querySelector(`.${containerClass}`);
    
    if (!this.container) {
      console.error(`❌ Element .${containerClass} .swiper-wrapper ไม่พบใน DOM`);
      return;
    }
    
    this.swiper = null;
  }

  stripHtml(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  renderPosts(posts) {
    if (!this.container) return;
    if (!posts.length) {
      console.warn("❗ No posts found.");
      return;
    }

    this.container.innerHTML = posts.map(post => `
        <div class="swiper-slide">
        <a href="?pages=article&act=post&post=${post.post_id}" class="btn">
            <div class="solution-card">
                <img src="${post.thumbnail_path}" alt="${post.title}">
                <h4>${post.title}</h4>
                <p>${this.stripHtml(post.content || "No content available").split(" ").slice(0, 20).join(" ")}...</p>
            </div>
            </a>
        </div>
    `).join("");
    this.initSwiper();
  }

  initSwiper() {
    if (!this.swiperContainer) return;

    this.swiper = new Swiper(this.swiperContainer, {
      loop: true,
      grabCursor: true,
      slidesPerView: "auto",
      centeredSlides: false, 
      spaceBetween: 20,
      speed: 500,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 10, centeredSlides: false },
        640: { slidesPerView: 1.5, spaceBetween: 20, centeredSlides: false },
        1024: { slidesPerView: 2.5, spaceBetween: 30, centeredSlides: false },
        1280: { slidesPerView: 4, spaceBetween: 40, centeredSlides: false },
      },
    });
  }

  async init() {
    const api = new SwiperLandingPageAPI("https://u44tech.com/services/post_get_all.php");
    const posts = await api.fetchPosts(1, 9, 17);

    if (!this.container) return;
    this.renderPosts(posts);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  setTimeout(() => {
    const swiperRenderer = new SwiperLandingPostRenderer("landingSwiper");
    swiperRenderer.init();
  }, 100);
});

window.addEventListener('load', function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  window.scrollTo(0, 0);
});

let preventScroll = true;
setTimeout(() => {
  preventScroll = false;
}, 1000);

window.addEventListener('scroll', function(e) {
  if (preventScroll) {
    window.scrollTo(0, 0);
    e.preventDefault();
    return false;
  }
}, { passive: false });