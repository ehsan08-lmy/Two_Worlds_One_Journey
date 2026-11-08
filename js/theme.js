(() => {
  "use strict";
  // Day / Night theme. The saved choice is applied by a tiny inline script in <head> (no flash);
  // this file adds the toggle button and the circular-reveal animation.
  const KEY = "twTheme";
  const root = document.documentElement;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = document.querySelector(".navbar-nav");
  if (!list) return;

  const item = document.createElement("li");
  item.className = "nav-item theme-item";
  item.innerHTML = `<button class="theme-toggle" type="button" aria-pressed="false">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle class="sun-core" cx="12" cy="12" r="4.5"/><g class="sun-rays"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></g><path class="moon" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
    <span class="visually-hidden theme-label"></span></button>`;
  list.append(item);
  const button = item.querySelector("button");

  function paint() {
    const dark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
    item.querySelector(".theme-label").textContent = dark ? "Day mode" : "Night mode";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e1c19" : "#183a35");
  }
  function apply(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch (error) { /* private mode: ignore */ }
    paint();
  }
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (!document.startViewTransition || calm) { apply(next); return; }
    // Circle grows from the button until it covers the whole screen.
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-anim");
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-anim"));
  });
  paint();
})();
