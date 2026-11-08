(() => {
  "use strict";
  const { places, STORAGE_KEY, $, $$, escapeHTML, announce } = window.TW;
  function setupLightbox() {
    const overlay = $("#photoLightbox");
    const img = $("#lightboxImage");
    const caption = $("#lightboxCaption");
    if (!overlay || !window.jQuery) return;
    const closeButton = $(".lightbox-close", overlay);
    let returnFocus = null;
    const open = (src, alt, trigger) => {
      if (!src) return;
      returnFocus = trigger || document.activeElement;
      img.src = src; img.alt = alt || "Photograph"; caption.textContent = alt || "";
      window.jQuery(overlay).stop(true, true).css("display", "flex").hide().fadeIn(180);
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeButton.focus();
    };
    const close = () => {
      window.jQuery(overlay).stop(true, true).fadeOut(160, () => {
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        img.src = "";
        returnFocus?.focus();
        returnFocus = null;
      });
    };
    document.addEventListener("click", (event) => {
      const target = event.target.closest(".photo-open");
      if (target && !event.target.closest("button, a")) {
        const image = $("img", target);
        const src = target.dataset.photo || image?.currentSrc || image?.src;
        open(src, target.dataset.caption || image?.alt || "", target);
      }
    });
    closeButton.addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", (event) => {
      if (overlay.getAttribute("aria-hidden") !== "false") return;
      if (event.key === "Escape") close();
      if (event.key === "Tab") { event.preventDefault(); closeButton.focus(); }
    });
  }

  function setupPhotoAccessibility() {
    $$(".photo-open").forEach((trigger) => {
      if (trigger.matches("a, button")) return;
      const image = $("img", trigger);
      const description = trigger.dataset.caption || image?.alt || "photograph";
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-label", `Open photo: ${description}`);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const trigger = event.target.closest(".photo-open");
      if (!trigger || event.target.closest("a, button")) return;
      event.preventDefault();
      trigger.click();
    });
  }

  function setupReveal() {
    const items = $$('[data-reveal]');
    if (!("IntersectionObserver" in window)) { items.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); currentObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    items.forEach((item) => observer.observe(item));
  }

  function setupMisc() {
    const year = $("#yearNow");
    const bp = $("#builderPlaces");
    if (bp) bp.textContent = String(places.length).padStart(2, "0");
    if (year) year.textContent = new Date().getFullYear();
    const counter = $("#messageCounter");
    if (counter && $("#visitorMessage")) counter.textContent = `${$("#visitorMessage").value.length} / 500`;
    window.TW.atlas.attachImageFallbacks();
  }

  window.TW.ui = { setupLightbox, setupPhotoAccessibility, setupReveal, setupMisc };
})();
