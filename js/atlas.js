(() => {
  "use strict";
  const { places, STORAGE_KEY, $, $$, escapeHTML, announce } = window.TW;
  const R = () => window.TW.route;
  function renderPlaceCard(place, compact = false) {
    return `<article class="${compact ? "featured-card" : "place-card"}" data-place-card="${escapeHTML(place.id)}" style="view-transition-name:p-${escapeHTML(place.id)}">
      <figure class="${compact ? "" : "place-card-image"} photo-open" data-photo="${escapeHTML(place.image)}" data-caption="${escapeHTML(place.name)} · ${escapeHTML(place.credit)}">
        <img src="${escapeHTML(place.image)}" alt="${escapeHTML(place.alt)}" loading="lazy" data-place-image>
        ${compact ? "" : `<span class="place-country-tag">${escapeHTML(place.country)}</span><span class="place-category">${escapeHTML(place.category)}</span>`}
      </figure>
      <div class="${compact ? "featured-card-body" : "place-card-content"}">
        <small class="${compact ? "" : "place-region"}">${escapeHTML(compact ? `${place.country} · ${place.region}` : place.region)}</small>
        <h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.description)}</p>
      </div>
      ${compact ? `<div class="featured-card-footer"><a href="roots.html#explorer">Explore place ↗</a><span>${escapeHTML(place.category)}</span></div>` : `<div class="place-card-meta"><small>Suggested visit · ${place.duration} min</small><button class="add-stop" type="button" data-add-stop="${escapeHTML(place.id)}" aria-pressed="false">+ Add to my route</button></div><div class="place-credit">Photo: <a href="${escapeHTML(place.source)}" target="_blank" rel="noopener">${escapeHTML(place.credit)}</a></div>`}
    </article>`;
  }

  function renderFeatured() {
    const target = $("#featuredPlaces");
    if (!target) return;
    const featuredIds = ["band-e-amir", "blue-mosque", "baiterek"];
    const featured = featuredIds.map((id) => places.find((place) => place.id === id)).filter(Boolean);
    target.innerHTML = featured.map((place) => renderPlaceCard(place, true)).join("");
  }

  function getCurrentFilter() {
    return $(".filter-chip.is-active")?.dataset.filter || "all";
  }
  function renderExplorer() {
    const grid = $("#placeGrid");
    if (!grid) return;
    const query = ($("#placeSearch")?.value || "").trim().toLowerCase();
    const country = getCurrentFilter();
    const category = $(".category-chip.is-active")?.dataset.category || "all";
    const savedOnly = $("#savedOnly")?.getAttribute("aria-pressed") === "true";
    const sortBy = $("#placeSort")?.value || "featured";
    const savedIds = new Set(R().get());
    let results = places.filter((place) => {
      const matchesCountry = country === "all" || place.country === country;
      const matchesCategory = category === "all" || place.category === category;
      const matchesSaved = !savedOnly || savedIds.has(place.id);
      const haystack = `${place.name} ${place.region} ${place.country} ${place.category} ${place.description}`.toLowerCase();
      return matchesCountry && matchesCategory && matchesSaved && haystack.includes(query);
    });
    if (sortBy === "az") results.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "country") results.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
    if (sortBy === "duration") results.sort((a, b) => a.duration - b.duration);
    grid.innerHTML = results.map((place) => renderPlaceCard(place)).join("");
    const count = $("#resultsCount");
    if (count) count.textContent = `${results.length} ${results.length === 1 ? "place" : "places"}`;
    const savedCount = $("#savedOnlyCount");
    if (savedCount) savedCount.textContent = String(savedIds.size);
    const total = $("#atlasTotal");
    if (total) total.textContent = String(places.length).padStart(2, "0");
    const empty = $("#emptyState");
    if (empty) empty.hidden = results.length !== 0;
    R().update();
    attachImageFallbacks(grid);
    document.dispatchEvent(new CustomEvent("tw:atlasupdated", { detail: { count: results.length, query } }));
  }

  // Same-document View Transition: cards glide to their new positions (skipped when unsupported or motion is reduced).
  const morph = (update) => (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? document.startViewTransition(update) : update());
  function setupExplorer() {
    const search = $("#placeSearch");
    const params = new URLSearchParams(location.search);
    const requestedCountry = params.get("country");
    const requestedPlaceId = params.get("place");
    if (requestedCountry === "Afghanistan" || requestedCountry === "Kazakhstan") {
      $$(".filter-chip").forEach((chip) => {
        const active = chip.dataset.filter === requestedCountry;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      renderExplorer();
    }
    if (requestedPlaceId) {
      const requestedPlace = places.find((place) => place.id === requestedPlaceId);
      if (requestedPlace && search) search.value = requestedPlace.name;
    }
    if (requestedCountry || requestedPlaceId) {
      history.replaceState(null, "", location.pathname + location.hash);
      renderExplorer();
      if (requestedPlaceId && search) window.setTimeout(() => search.focus({ preventScroll: true }), 180);
    }
    if (search) search.addEventListener("input", renderExplorer);
    const sort = $("#placeSort");
    if (sort) sort.addEventListener("change", () => morph(renderExplorer));
    $$(".filter-chip").forEach((button) => button.addEventListener("click", () => {
      $$(".filter-chip").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      morph(renderExplorer);
    }));
    $$(".category-chip").forEach((button) => button.addEventListener("click", () => {
      $$(".category-chip").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      morph(renderExplorer);
    }));
    $("#savedOnly")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const active = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
      morph(renderExplorer);
    });
    $("#resetFilters")?.addEventListener("click", () => {
      if (search) search.value = "";
      $$(".filter-chip").forEach((chip) => {
        const active = chip.dataset.filter === "all";
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      if (sort) sort.value = "featured";
      $$(".category-chip").forEach((chip) => {
        const active = chip.dataset.category === "all";
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      const savedOnly = $("#savedOnly");
      if (savedOnly) { savedOnly.setAttribute("aria-pressed", "false"); savedOnly.classList.remove("is-active"); }
      morph(renderExplorer);
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && search) {
        event.preventDefault(); search.focus();
      }
    });
  }

  function attachImageFallbacks(scope = document) {
    $$('img[data-place-image], img:not(#lightboxImage)', scope).forEach((image) => {
      if (image.dataset.fallbackBound) return;
      image.dataset.fallbackBound = "true";
      image.addEventListener("error", () => {
        const figure = image.closest("figure, .hero-photo, .timeline-photo, .journey-hero-photo, .world-card-image, .collage-image");
        if (!figure || figure.querySelector(".image-fallback")) return;
        const fallback = document.createElement("div");
        fallback.className = "image-fallback";
        fallback.textContent = image.alt || "Photograph temporarily unavailable";
        figure.appendChild(fallback);
        image.hidden = true;
      }, { once: true });
    });
  }

  window.TW.atlas = { renderFeatured, renderExplorer, setupExplorer, attachImageFallbacks };
})();
