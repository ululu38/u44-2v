document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const element = document.getElementById("forcelook");
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      console.warn('Element with id "forcelook" not found');
    }
  }, 100);
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      const element = document.getElementById("forcelook");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        observer.disconnect();
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
