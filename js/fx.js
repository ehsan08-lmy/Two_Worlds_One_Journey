(() => {
  "use strict";
  // Visual-effects layer. Pure enhancement: the site works without it.
  const { places, $, $$, escapeHTML } = window.TW;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raf = window.requestAnimationFrame.bind(window);

  // 1. Scroll progress bar + back-to-top button
  const bar = document.createElement("div"); bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true");
  const top = document.createElement("button"); top.className = "to-top"; top.type = "button"; top.textContent = "↑"; top.setAttribute("aria-label", "Back to top");
  document.body.append(bar, top);
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));
  const timeline = $(".story-timeline");
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    raf(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      top.classList.toggle("is-shown", scrollY > 600);
      if (timeline) {
        const r = timeline.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
        timeline.style.setProperty("--prog", p.toFixed(3));
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // 2. Headline: split into words that fly in one by one
  const h1 = $("h1");
  if (h1 && !calm) {
    let i = 0;
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) { frag.append(part); return; }
            const s = document.createElement("span"); s.className = "word"; s.style.setProperty("--i", i++); s.textContent = part; frag.append(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") wrap(child);
      });
    };
    wrap(h1);
  }

  // 3. Hero: blobs, cursor spotlight and gentle parallax
  const hero = $(".hero-section, .page-hero");
  if (hero) {
    hero.prepend(...["a", "b", "c"].map((k) => { const b = document.createElement("div"); b.className = `blob blob--${k}`; b.setAttribute("aria-hidden", "true"); return b; }));
    const light = document.createElement("div"); light.className = "spotlight"; light.setAttribute("aria-hidden", "true"); hero.prepend(light);
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty("--mx", `${x * 100}%`); hero.style.setProperty("--my", `${y * 100}%`);
      hero.style.setProperty("--px", (x - 0.5).toFixed(2)); hero.style.setProperty("--py", (y - 0.5).toFixed(2));
    });
    // 4. A kinetic route constellation replaces the ordinary scrolling ticker.
    // Each stop is a real location and links directly to its searchable atlas record.
    const routePath = "M8 58 C145 8 210 102 350 55 S570 13 710 56 S930 103 1070 56 S1290 10 1430 55 S1645 100 1792 56";
    // SVG motion also respects the operating-system reduced-motion preference.
    const ribbonMotion = calm ? "" : `<animateMotion dur="18s" repeatCount="indefinite" path="${routePath}"/>`;
    const ribbonPosition = calm ? `cx="900" cy="56"` : "";
    const stops = places.map((place, index) => {
      const short = place.country === "Afghanistan" ? "AFG" : "KAZ";
      return `<a class="route-stop" href="roots.html?place=${encodeURIComponent(place.id)}#explorer" aria-label="Find ${escapeHTML(place.name)} in the place atlas">
        <span class="route-stop-top"><i>${String(index + 1).padStart(2, "0")}</i><b>${short}</b></span>
        <strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(place.region)}</small>
      </a>`;
    }).join("");
    const strip = document.createElement("section");
    strip.className = "route-ribbon";
    strip.setAttribute("aria-label", "Interactive route line linking the places in Afghanistan and Kazakhstan");
    strip.innerHTML = `<div class="route-ribbon-head"><span><i></i> FIELD ROUTE / 13 DOCUMENTED STOPS</span><span>AFGHANISTAN <b>↔</b> KAZAKHSTAN</span></div>
      <div class="route-ribbon-viewport" tabindex="0" aria-label="Scrollable line of destination links">
        <div class="route-ribbon-canvas">
          <svg class="route-ribbon-map" viewBox="0 0 1800 112" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="ribbonInk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c06e52"/><stop offset=".5" stop-color="#d2b16d"/><stop offset="1" stop-color="#6f9aad"/></linearGradient></defs>
            <path class="route-ribbon-track" d="${routePath}"/>
            <path class="route-ribbon-draw" d="${routePath}"/>
            <circle class="route-ribbon-traveller-halo" ${ribbonPosition} r="13">${ribbonMotion}</circle>
            <circle class="route-ribbon-traveller" ${ribbonPosition} r="5">${ribbonMotion}</circle>
          </svg>
          <div class="route-ribbon-stops">${stops}</div>
        </div>
      </div>`;
    hero.after(strip);
  }

  // 5. Cards: stagger numbers, 3D tilt and moving highlight (event delegation covers cards rendered later)
  const stagger = (grid) => $$(":scope > *", grid).forEach((el, n) => el.style.setProperty("--n", n));
  ["#placeGrid", "#featuredPlaces", ".world-card-grid"].forEach((sel) => {
    const grid = $(sel); if (!grid) return;
    stagger(grid); new MutationObserver(() => stagger(grid)).observe(grid, { childList: true });
  });
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest && e.target.closest(".place-card, .featured-card, .world-card");
    if (!card || calm || e.pointerType === "touch") return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${((0.5 - y) * 9).toFixed(2)}deg`);
    card.style.setProperty("--sx", `${x * 100}%`); card.style.setProperty("--sy", `${y * 100}%`);
  });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest && e.target.closest(".place-card, .featured-card, .world-card");
    if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
  });

  // 6. Confetti when a place is added to the route
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-stop]");
    if (!btn || calm) return;
    setTimeout(() => {
      if (!btn.classList.contains("is-added")) return;
      const r = btn.getBoundingClientRect();
      const colors = ["#ba7057", "#d6b66a", "#183a35", "#e7c7b7", "#dce5d9"];
      for (let i = 0; i < 16; i++) {
        const c = document.createElement("span"); c.className = "confetti";
        c.style.left = `${r.left + r.width / 2}px`; c.style.top = `${r.top + r.height / 2}px`;
        c.style.background = colors[i % colors.length];
        c.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
        c.style.setProperty("--dy", `${-60 - Math.random() * 140}px`);
        c.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
        document.body.append(c); setTimeout(() => c.remove(), 1000);
      }
    }, 0);
  });

  // 7. Route counter bumps whenever the saved route changes
  const badge = $("#routeCount");
  if (badge) new MutationObserver(() => { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }).observe(badge, { childList: true });

  // 8. Numbers count up when they scroll into view
  const counters = $$("#atlasTotal, .builder-facts strong, .atlas-total strong");
  if (!calm && "IntersectionObserver" in window) {
    const seen = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return; seen.unobserve(en.target);
      const el = en.target, end = parseInt(el.textContent, 10), len = el.textContent.length, t0 = performance.now();
      if (Number.isNaN(end)) return;
      const step = (t) => { const k = Math.min(1, (t - t0) / 1100); el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3)))).padStart(len, "0"); if (k < 1) raf(step); };
      raf(step);
    }), { threshold: 0.6 });
    counters.forEach((el) => seen.observe(el));
  }

  // 9. A glowing traveller moves along the illustrated route
  const svg = $(".route-graphic svg");
  if (svg && !calm) {
    svg.insertAdjacentHTML("beforeend",
      `<circle r="7" fill="#fffdf8"><animateMotion dur="6s" repeatCount="indefinite" path="M46 197 C165 20 284 252 386 113 S520 67 594 80"/></circle>
       <circle r="7" fill="none" stroke="#d6b66a" stroke-width="2"><animateMotion dur="6s" repeatCount="indefinite" path="M46 197 C165 20 284 252 386 113 S520 67 594 80"/><animate attributeName="r" values="7;20;7" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/></circle>`);
  }
})();
