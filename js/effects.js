(() => {
  "use strict";
  function setupJQueryEffects() {
    if (!window.jQuery) return;
    const jq = window.jQuery;
    const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Effect 1: smooth in-page scrolling; stop(true) keeps repeated clicks controlled.
    jq(document).on("click", 'a[href^="#"]', function (event) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      jq("html, body").stop(true).animate({ scrollTop: jq(target).offset().top - 84 }, calm ? 0 : 620);
    });
    // Effect 2: accessible accordion with slideToggle.
    jq(document).on("click", ".faq-question", function () {
      const button = this;
      const answer = jq(button).next(".faq-answer");
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      jq(".faq-answer").not(answer).stop(true, true).slideUp(calm ? 0 : 190);
      jq(".faq-question").not(button).attr("aria-expanded", "false");
      answer.stop(true, true).slideToggle(calm ? 0 : 190);
      button.setAttribute("aria-expanded", String(willOpen));
    });

    // Effect 3: route constellation can be explored with a horizontal trackpad or mouse wheel.
    jq(document).on("wheel", ".route-ribbon-viewport", function (event) {
      const original = event.originalEvent;
      if (Math.abs(original.deltaY) > Math.abs(original.deltaX) && this.scrollWidth > this.clientWidth) {
        this.scrollLeft += original.deltaY;
        event.preventDefault();
      }
    });

    // Effect 4: filter interactions briefly illuminate the atlas frame and count.
    document.addEventListener("tw:atlasupdated", () => {
      const controls = jq(".explorer-controls");
      controls.stop(true, true).removeClass("is-updating");
      if (controls.length) {
        void controls[0].offsetWidth;
        controls.addClass("is-updating");
        window.setTimeout(() => controls.removeClass("is-updating"), 520);
      }
      jq("#resultsCount").stop(true, true).fadeTo(calm ? 0 : 75, .35).fadeTo(calm ? 0 : 230, 1);
    });
  }

  window.TW.effects = { setupJQueryEffects };
})();
