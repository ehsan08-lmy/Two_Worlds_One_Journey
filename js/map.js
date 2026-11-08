(() => {
  "use strict";
  // Interactive map (Leaflet + OpenStreetMap). It only draws; the route itself lives in route.js.
  const { places, $, escapeHTML } = window.TW;
  let map = null, routeLayer = null;
  const markers = {};

  // Curved arc between two points: a quadratic Bezier whose control point is pushed sideways.
  function arc(a, b, steps = 28) {
    const ctrl = [(a[0] + b[0]) / 2 - (b[1] - a[1]) * 0.2, (a[1] + b[1]) / 2 + (b[0] - a[0]) * 0.2];
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps, u = 1 - t;
      return [u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]];
    });
  }
  function pin(place, order) {
    const side = place.country === "Afghanistan" ? "afg" : "kaz";
    return L.divIcon({
      className: "pin-wrap",
      html: `<span class="pin pin--${side}${order > -1 ? " is-saved" : ""}"><b>${order > -1 ? order + 1 : ""}</b></span>`,
      iconSize: [32, 42], iconAnchor: [16, 40], popupAnchor: [0, -38]
    });
  }
  function popupHTML(p) {
    return `<div class="map-pop"><img src="${escapeHTML(p.image.replace("width=1280", "width=500").replace("width=960", "width=500"))}" alt="${escapeHTML(p.alt)}" loading="lazy">
      <small>${escapeHTML(p.country)} · ${escapeHTML(p.region)}</small><strong>${escapeHTML(p.name)}</strong>
      <button class="add-stop" type="button" data-add-stop="${escapeHTML(p.id)}" aria-pressed="false">+ Add to my route</button></div>`;
  }
  function setup() {
    const el = $("#routeMap");
    if (!el) return;
    if (!window.L) { el.innerHTML = '<p class="map-fallback">The map could not load. Check your internet connection.</p>'; return; }
    map = L.map(el, { scrollWheelZoom: false, worldCopyJump: false }).setView([43, 67], 4);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    places.forEach((p) => { markers[p.id] = L.marker([p.lat, p.lng], { icon: pin(p, -1), title: p.name, alt: p.name }).addTo(map).bindPopup(() => popupHTML(p), { minWidth: 220 }); });
    map.once("focus", () => map.scrollWheelZoom.enable());
    map.on("popupopen", () => window.TW.route.update());
    routeLayer = L.layerGroup().addTo(map);
  }
  function refresh() {
    if (!map) return;
    const ids = window.TW.route.get();
    const stops = ids.map((id) => places.find((p) => p.id === id)).filter(Boolean);
    places.forEach((p) => markers[p.id].setIcon(pin(p, stops.indexOf(p))));
    routeLayer.clearLayers();
    const pts = [];
    stops.slice(1).forEach((s, i) => pts.push(...arc([stops[i].lat, stops[i].lng], [s.lat, s.lng])));
    if (pts.length) {
      L.polyline(pts, { color: "#d6b66a", weight: 9, opacity: 0.25, interactive: false }).addTo(routeLayer);
      L.polyline(pts, { color: "#ba7057", weight: 3, dashArray: "9 11", className: "route-line", interactive: false }).addTo(routeLayer);
    }
    if (stops.length) map.flyToBounds(L.latLngBounds(stops.map((s) => [s.lat, s.lng])).pad(0.35), { duration: 1.1, maxZoom: 8 });
  }
  window.TW.map = { setup, refresh };
})();
