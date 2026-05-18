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