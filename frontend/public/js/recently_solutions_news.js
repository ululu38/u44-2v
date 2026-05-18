class SwiperAPI {

  constructor(apiUrl) {

    this.apiUrl = apiUrl;

  }



  async fetchPosts(page = 1, limit = 6, categoryId = null) {

    try {

      let url = `${this.apiUrl}?page=${page}&limit=${limit}`;

      if (categoryId) url += `&category_id=${categoryId}`;



      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);



      const data = await response.json();

      const filteredPosts = data.posts.filter(post => post.categories?.toLowerCase() === "solution news");



      return { posts: filteredPosts, pagination: data.pagination };

    } catch {

      return { posts: [], pagination: {} };

    }

  }

}



class SwiperRenderer {

  constructor(containerId) {

    this.container = document.getElementById(containerId);

  }



  renderPosts(posts) {

    this.container.innerHTML = posts.map(post => `

      <div class="swiper-slide recently">

        <div class="card recently">

          <a href="?pages=article&act=post&post=${post.post_id}" class="no-underline">

            <img src="${post.thumbnail_path}" alt="${post.title}" loading="lazy">

            <div class="card-overlay recently"></div>

            <div class="card-body recently">

              <p class="card-text recently">${post.title}</p>

              <p class="text-truncate-2 recently">${this.stripHTML(post.content)}</p>
"https://u44tech.com/services/
            </div>

          </a>

        </div>

      </div>

    `).join("");

  }



  stripHTML(html) {

    const tempDiv = document.createElement("div");

    tempDiv.innerHTML = html;

    return tempDiv.textContent || tempDiv.innerText || "";

  }

}



// เฉพาะ Swiper ที่เกี่ยวกับ Recently Solutions เท่านั้น

const recentlySwiper = new Swiper(".swiper-container.recently", {

  loop: true,

  spaceBetween: 20,

  slidesPerView: 4,

  autoplay: {

    delay: 4000,

    disableOnInteraction: false,

  },

  pagination: {

    el: ".swiper-pagination.recently",

    clickable: true

  },

  breakpoints: {

    320: { slidesPerView: 1, spaceBetween: 10 },

    640: { slidesPerView: 2, spaceBetween: 15 },

    1024: { slidesPerView: 3, spaceBetween: 20 },

    1200: { slidesPerView: 4, spaceBetween: 20 }

  }

});



// Fetch & Render Posts เฉพาะ Recently Solutions

(async () => {

  const api = new SwiperAPI("services/post_get_all.php");

  const renderer = new SwiperRenderer("recently-swiper");

  await api.fetchPosts(1, 6, 1).then(data => renderer.renderPosts(data.posts));

})();

