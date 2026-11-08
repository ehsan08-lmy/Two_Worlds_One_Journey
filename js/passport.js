(() => {
  "use strict";
  const { places, $, escapeHTML } = window.TW;
  let firstRender = true;
  let previous = new Set();

  const render = () => {
    const grid = $("#passportStamps");
    if (!grid || !window.TW.route) return;

    const saved = new Set(window.TW.route.get());
    const earned = places.filter((place) => saved.has(place.id)).length;
    const total = places.length;
    const progressText = $("#passportProgressText");
    const progress = $("#passportProgress");
    const fill = $("#passportProgressFill");

    if (progressText) progressText.textContent = `${earned} / ${total}`;
    if (progress) {
      progress.setAttribute("aria-valuemax", String(total));
      progress.setAttribute("aria-valuenow", String(earned));
    }
    if (fill) fill.style.width = `${total ? earned / total * 100 : 0}%`;

    grid.innerHTML = places.map((place, index) => {
      const collected = saved.has(place.id);
      const isNew = !firstRender && collected && !previous.has(place.id);
      const side = place.country === "Afghanistan" ? "afg" : "kaz";
      const short = place.country === "Afghanistan" ? "AFG" : "KAZ";
      const action = collected ? "Remove this place from your route" : "Add this place to your route";
      return `<button class="passport-stamp ${collected ? "is-collected" : "is-awaiting"} passport-stamp--${side}${isNew ? " is-new-stamp" : ""}"
          type="button" data-passport-stop="${escapeHTML(place.id)}" aria-pressed="${String(collected)}"
          aria-label="${escapeHTML(place.name)}. ${collected ? "Collected" : "Awaiting"}. ${action}." title="${action}" style="--stamp-order:${index}">
        <img class="passport-stamp-photo" src="${escapeHTML(place.image)}" alt="" loading="lazy" decoding="async">
        <span class="passport-stamp-wash" aria-hidden="true"></span>
        <span class="passport-stamp-top"><span class="passport-stamp-no">${String(index + 1).padStart(2, "0")}</span><span class="passport-stamp-mark" aria-hidden="true">${collected ? "✳" : "+"}</span></span>
        <span class="passport-stamp-country">${short} · ${collected ? "COLLECTED" : "AWAITING"}</span>
        <strong>${escapeHTML(place.name)}</strong>
        <small>${escapeHTML(place.region)}</small>
        <span class="passport-stamp-action" aria-hidden="true">${collected ? "REMOVE MARK" : "COLLECT MARK"}</span>
      </button>`;
    }).join("");

    if (!firstRender) {
      grid.querySelectorAll(".is-new-stamp").forEach((stamp) => {
        window.setTimeout(() => stamp.classList.remove("is-new-stamp"), 850);
      });
    }
    previous = saved;
    firstRender = false;
  };

  document.addEventListener("tw:routechange", render);

  // The passport is also an interactive route control: click a photograph to collect/remove it.
  const grid = $("#passportStamps");
  if (grid) {
    if (window.jQuery) {
      const jq = window.jQuery;
      const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      jq(grid).on("click.twPassport", ".passport-stamp", function () {
        const id = this.dataset.passportStop;
        if (!id || !window.TW.route) return;
        const book = this.closest(".passport-book");
        if (book) {
          jq(book).stop(true, true).addClass("is-stamping");
          window.setTimeout(() => jq(book).removeClass("is-stamping"), 700);
        }
        window.TW.route.toggle(id);
      });
      jq(grid).on("mouseenter.twPassport focusin.twPassport", ".passport-stamp", function () {
        jq(this).find(".passport-stamp-action").stop(true, true).fadeTo(calm ? 0 : 120, 1);
      });
      jq(grid).on("mouseleave.twPassport focusout.twPassport", ".passport-stamp", function () {
        jq(this).find(".passport-stamp-action").stop(true, true).fadeTo(calm ? 0 : 120, 0.78);
      });
    } else {
      grid.addEventListener("click", (event) => {
        const stamp = event.target.closest("[data-passport-stop]");
        if (stamp && window.TW.route) window.TW.route.toggle(stamp.dataset.passportStop);
      });
    }
  }

  $("#printPassport")?.addEventListener("click", () => {
    document.body.classList.add("print-passport");
    window.print();
  });
  window.addEventListener("afterprint", () => document.body.classList.remove("print-passport"));
  window.TW.passport = { render };
  render();
})();
