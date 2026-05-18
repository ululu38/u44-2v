document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".solution-nav");
  let isDragging = false;
  let startX;
  let scrollLeft;
  const activeMenuItem = document.querySelector(".solution-nav a.active");
  if (activeMenuItem) {
    activeMenuItem.scrollIntoView({
      block: "center",
      inline: "center",
    });
  }
  
  nav.addEventListener("mousedown", (e) => {
    isDragging = true;
    nav.classList.add("dragging");
    startX = e.pageX - nav.offsetLeft;
    scrollLeft = nav.scrollLeft;
    e.preventDefault();
  });

  nav.addEventListener("mouseleave", () => {
    isDragging = false;
    nav.classList.remove("dragging");
  });

  nav.addEventListener("mouseup", () => {
    isDragging = false;
    nav.classList.remove("dragging");
  });

  nav.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - nav.offsetLeft;
    const walk = (x - startX) * 1.5;
    nav.scrollLeft = scrollLeft - walk;
  });
  nav.addEventListener("click", (e) => {
    if (isDragging) {
      e.preventDefault();
      isDragging = false;
    }
  });
});
