(() => {
  "use strict";
  const config = window.SWITCHING_TO_GUNS_SITE || {};
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch { return null; }
  };
  const steamUrl = safeUrl(config.steamUrl);
  if (steamUrl && new URL(steamUrl).hostname === "store.steampowered.com") {
    const steamLink = document.querySelector("#steam-link");
    steamLink.href = steamUrl;
    document.querySelector("#steam-link-row").hidden = false;
  }
  if (config.releaseDescription) document.querySelector("#release-description").textContent = config.releaseDescription;

  const viewer = document.querySelector("#image-viewer");
  if (typeof viewer.showModal !== "function") return; // Image links still work without dialog support.
  const gallery = Array.from(document.querySelectorAll("[data-gallery]"));
  let current = 0;
  let opener;
  let imageRequest = 0;
  const showImage = (index) => {
    const request = ++imageRequest;
    current = (index + gallery.length) % gallery.length;
    const link = gallery[current];
    const thumbnail = link.querySelector("img");
    // A fresh node cannot retain the previous image's painted pixels.
    const preview = new Image();
    preview.id = "viewer-image";
    preview.width = thumbnail.getAttribute("width") || 1600;
    preview.height = thumbnail.getAttribute("height") || 900;
    preview.alt = thumbnail.alt;
    preview.src = thumbnail.currentSrc || thumbnail.src;
    document.querySelector("#viewer-image").replaceWith(preview);
    const fullImage = new Image();
    fullImage.id = "viewer-image";
    fullImage.width = 3840;
    fullImage.height = 2160;
    fullImage.alt = thumbnail.alt;
    fullImage.src = link.href;
    fullImage.decode().then(() => {
      if (request === imageRequest && viewer.open) preview.replaceWith(fullImage);
    }).catch(() => {}); // Keep the selected preview if the full image is unavailable.
    document.querySelector("#viewer-title").textContent = link.dataset.title;
    document.querySelector("#viewer-count").textContent = `${current + 1} of ${gallery.length}`;
    document.querySelector("#viewer-download").href = link.href;
  };
  gallery.forEach((link, index) => link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    showImage(index);
    viewer.showModal();
    document.body.classList.add("viewer-open");
  }));
  document.querySelector("#viewer-close").addEventListener("click", () => viewer.close());
  document.querySelector("#viewer-prev").addEventListener("click", () => showImage(current - 1));
  document.querySelector("#viewer-next").addEventListener("click", () => showImage(current + 1));
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showImage(current + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener("close", () => {
    imageRequest += 1;
    document.body.classList.remove("viewer-open");
    opener?.focus({ preventScroll: true });
  });
})();
