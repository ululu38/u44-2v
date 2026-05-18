document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".share-button");
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);
  const postId = new URLSearchParams(window.location.search).get("post");

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${pageUrl}&description=${pageTitle}`,
    reddit: `https://reddit.com/submit?url=${pageUrl}&title=${pageTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`,
  };
  buttons.forEach((button) => {
    const platform = button.dataset.platform;
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const width = 600;
      const height = 400;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      window.open(
        shareUrls[platform],
        "share",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    });
  });
});
