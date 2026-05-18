var swiper1 = new Swiper(".swiper", {
  slidesPerView: 4,
  direction: getDirection(),
  on: {
    resize: function () {
      swiper.changeDirection(getDirection());
    },
  },
  autoplay: {
    delay: 100,
    disableOnInteraction: false,
  },
  effect: "slide",
  speed: 10000,
});

function getDirection() {
  var windowWidth = window.innerWidth;
  var direction = window.innerWidth <= 760 ? "vertical" : "horizontal";

  return direction;
}

document.addEventListener("DOMContentLoaded", function () {
  const swiper2 = new Swiper(".swiper-container", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    loop: true,
  });

  const galleryImages = document.querySelectorAll(".gallery-image");
  const swiperSlides = document.querySelectorAll(".swiper-slide img");

  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => {
      swiper.slideTo(index + 1);
    });
  });
});
