(() => {
  "use strict";
  // Entry point: runs after every module has registered itself on window.TW.
  const { atlas, route, ui, effects, form } = window.TW;
  atlas.renderFeatured();
  atlas.renderExplorer();
  if (window.TW.map) window.TW.map.setup();
  route.render();
  if (window.TW.passport) window.TW.passport.render();
  route.setup();
  atlas.setupExplorer();
  ui.setupLightbox();
  ui.setupPhotoAccessibility();
  effects.setupJQueryEffects();
  form.setupForm();
  ui.setupReveal();
  ui.setupMisc();
})();
