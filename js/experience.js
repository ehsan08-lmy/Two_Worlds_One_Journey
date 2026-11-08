(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const choices = $$("[data-world-lens]");
  const stage = $(".lens-stage");
  if (!choices.length || !stage) return;
  const content = {
    afghanistan: {
      label: "THE ROOTS CHAPTER",
      title: "A landscape that <em>remembers.</em>",
      text: "In Bamiyan, history is written into the cliffs and the valley. It is a place that reminds me that a beginning can stay with you, even as life takes you somewhere new.",
      coordinates: "34°49′ N · 67°49′ E",
      link: "roots.html?country=Afghanistan#explorer",
      linkText: "Explore Afghan places"
    },
    kazakhstan: {
      label: "THE BECOMING CHAPTER",
      title: "A horizon still <em>unfolding.</em>",
      text: "Astana is part of my present: a place of study, new routines, unfamiliar streets and possibilities I am still discovering. It is not a replacement for home; it is another chapter beside it.",
      coordinates: "51°08′ N · 71°26′ E",
      link: "roots.html?country=Kazakhstan#explorer",
      linkText: "Explore Kazakh places"
    }
  };
  const title = $("#lensStoryTitle"), text = $("#lensStoryText"), label = $(".lens-copy-label"), coords = $(".lens-coordinates"), link = $("#lensExploreLink");
  function choose(key) {
    const item = content[key];
    if (!item) return;
    choices.forEach((button) => {
      const active = button.dataset.worldLens === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    stage.dataset.worldCurrent = key;
    $$("[data-lens-image]").forEach((figure) => figure.classList.toggle("is-shown", figure.dataset.lensImage === key));
    if (title) title.innerHTML = item.title;
    if (text) text.textContent = item.text;
    if (label) label.textContent = item.label;
    if (coords) coords.textContent = item.coordinates;
    if (link) { link.href = item.link; link.innerHTML = `${item.linkText} <span>↗</span>`; }
  }
  choices.forEach((button) => button.addEventListener("click", () => choose(button.dataset.worldLens)));
  choose("afghanistan");
})();
