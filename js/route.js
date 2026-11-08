(() => {
  "use strict";
  const { places, STORAGE_KEY, $, $$, escapeHTML, announce } = window.TW;
  function readRoute() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((id) => places.some((place) => place.id === id)) : [];
    } catch (error) {
      console.warn("Saved route could not be read; starting with an empty route.", error);
      return [];
    }
  }
  let savedRoute = readRoute();
  function persistRoute() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoute)); }
    catch (error) { console.warn("This browser could not save the route locally.", error); }
  }
  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${String(mins).padStart(2, "0")}m`;
  }
  function updatePlaceButtons() {
    $$('[data-add-stop]').forEach((button) => {
      const isAdded = savedRoute.includes(button.dataset.addStop);
      button.classList.toggle("is-added", isAdded);
      button.setAttribute("aria-pressed", String(isAdded));
      button.textContent = isAdded ? "✓ Added to route" : "+ Add to my route";
    });
  }
  function renderItinerary() {
    const list = $("#itineraryItems");
    const routeCount = savedRoute.length;
    const totalCount = $("#routeCount");
    const panelCount = $("#routePanelCount");
    if (totalCount) totalCount.textContent = routeCount;
    if (panelCount) panelCount.textContent = routeCount;
    if (list) {
      if (!routeCount) {
        list.innerHTML = `<div class="itinerary-empty"><span>✳</span><strong>Your route is waiting.</strong><p>Open the <a href="roots.html#explorer">place atlas</a> and choose a few destinations to begin.</p></div>`;
      } else {
        const items = savedRoute.map((id) => places.find((place) => place.id === id)).filter(Boolean);
        list.innerHTML = `<ul class="itinerary-list">${items.map((place) => `<li><span class="itinerary-place-info"><strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(place.country)} · ${place.duration} min</small></span><span class="stop-actions"><button class="move-stop" type="button" data-move="${escapeHTML(place.id)}" data-step="-1" aria-label="Move ${escapeHTML(place.name)} up">↑</button><button class="move-stop" type="button" data-move="${escapeHTML(place.id)}" data-step="1" aria-label="Move ${escapeHTML(place.name)} down">↓</button></span><button class="remove-stop" type="button" data-remove-stop="${escapeHTML(place.id)}" aria-label="Remove ${escapeHTML(place.name)} from route">×</button></li>`).join("")}</ul>`;
      }
    }
    const totalPlaces = $("#routeTotalPlaces");
    const totalTime = $("#routeTotalTime");
    const minutes = savedRoute.reduce((sum, id) => sum + (places.find((place) => place.id === id)?.duration || 0), 0);
    if (totalPlaces) totalPlaces.textContent = String(routeCount);
    if (totalTime) totalTime.textContent = formatDuration(minutes);
    renderBalance();
    const km = $("#routeDistance");
    if (km) km.textContent = `${Math.round(routeKm()).toLocaleString("en-US")} km`;
    if (window.TW.map) window.TW.map.refresh();
    updatePlaceButtons();
    document.dispatchEvent(new CustomEvent("tw:routechange", { detail: { route: [...savedRoute] } }));
    if (document.querySelector("#savedOnly[aria-pressed='true']") && window.TW.atlas) window.TW.atlas.renderExplorer();
  }
  function toggleStop(id) {
    const exists = savedRoute.includes(id);
    if (exists) savedRoute = savedRoute.filter((savedId) => savedId !== id);
    else if (places.some((place) => place.id === id)) savedRoute.push(id);
    persistRoute();
    renderItinerary();
    const place = places.find((item) => item.id === id);
    announce(`${place?.name || "Place"} ${exists ? "removed from" : "added to"} your route.`);
  }



  // Haversine formula: great-circle distance in km between two latitude/longitude points.
  function haversine(a, b) {
    const rad = (deg) => (deg * Math.PI) / 180, R = 6371;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function routeKm() {
    const stops = savedRoute.map((id) => places.find((p) => p.id === id)).filter(Boolean);
    return stops.slice(1).reduce((sum, stop, i) => sum + haversine(stops[i], stop), 0);
  }
  // Standout feature: the "two-world balance" bar shows how the route splits between both countries.
  function renderBalance() {
    const box = $("#worldBalance");
    if (!box) return;
    const chosen = savedRoute.map((id) => places.find((p) => p.id === id)).filter(Boolean);
    const afg = chosen.filter((p) => p.country === "Afghanistan").reduce((s, p) => s + p.duration, 0);
    const kaz = chosen.filter((p) => p.country === "Kazakhstan").reduce((s, p) => s + p.duration, 0);
    const total = afg + kaz;
    const pctAfg = total ? Math.round((afg / total) * 100) : 50;
    $("#balanceAfg").style.width = (total ? pctAfg : 50) + "%";
    $("#balanceKaz").style.width = (total ? 100 - pctAfg : 50) + "%";
    $("#balanceText").textContent = !total ? "Add places from both countries to balance your route."
      : afg && kaz ? `${pctAfg}% Afghanistan · ${100 - pctAfg}% Kazakhstan` : `Your route stays in ${afg ? "Afghanistan" : "Kazakhstan"}. Add a place from the other world.`;
    box.classList.toggle("is-balanced", afg > 0 && kaz > 0 && Math.abs(pctAfg - 50) <= 20);
  }
  function moveStop(id, step) {
    const i = savedRoute.indexOf(id), j = i + step;
    if (i < 0 || j < 0 || j >= savedRoute.length) return;
    [savedRoute[i], savedRoute[j]] = [savedRoute[j], savedRoute[i]];
    persistRoute(); renderItinerary();
    announce(`Moved to position ${j + 1}.`);
    document.querySelector(`[data-move="${id}"][data-step="${step}"]`)?.focus();
  }
  function routeAsText() {
    const lines = savedRoute.map((id, n) => { const p = places.find((x) => x.id === id); return p ? `${n + 1}. ${p.name} (${p.country}) — ${p.duration} min` : ""; });
    return "My two-world route\n" + lines.join("\n") + `\nTotal: ${$("#routeTotalTime")?.textContent}`;
  }
  function setupRoute() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add-stop]"), rem = event.target.closest("[data-remove-stop]"), mv = event.target.closest("[data-move]");
      if (add) toggleStop(add.dataset.addStop);
      if (rem) toggleStop(rem.dataset.removeStop);
      if (mv) moveStop(mv.dataset.move, Number(mv.dataset.step));
    });
    $("#clearRoute")?.addEventListener("click", () => {
      if (!savedRoute.length) { announce("Your route is already empty."); return; }
      savedRoute = []; persistRoute(); renderItinerary(); announce("All saved places were cleared.");
    });
    $("#copyRoute")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (!savedRoute.length) { announce("Add a place before copying your route."); return; }
      try { await navigator.clipboard.writeText(routeAsText()); button.textContent = "Copied ✓"; }
      catch (error) { button.textContent = "Copy not available"; }
      setTimeout(() => { button.textContent = "Copy route"; }, 1800);
    });
  }
  window.TW.route = { setup: setupRoute, get: () => savedRoute, set: (r) => { savedRoute = r; }, persist: persistRoute, render: renderItinerary, toggle: toggleStop, update: updatePlaceButtons };
})();
