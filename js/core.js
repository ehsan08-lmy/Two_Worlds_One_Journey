(() => {
  "use strict";
  const places = Array.isArray(window.journeyPlaces) ? window.journeyPlaces : [];
  const STORAGE_KEY = "twoWorldsJourneyRouteV1";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function announce(message) {
    const live = $("#liveStatus");
    if (live) live.textContent = message;
  }
  window.TW = { places, STORAGE_KEY, $, $$, escapeHTML, announce };
})();
