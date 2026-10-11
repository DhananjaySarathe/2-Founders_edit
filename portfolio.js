"use strict";

// Normal page scrolling moves the portfolio. No wheel events are intercepted.
(function initPortfolio() {
  const root = document.getElementById("product");
  const runway = document.getElementById("portfolioScroll");
  const pin = document.getElementById("portfolioPin");
  const viewport = document.getElementById("portfolioViewport");
  const track = document.getElementById("portfolioTrack");
  const slides = [...track.querySelectorAll(":scope > [data-work-title]")];
  const tabs = document.getElementById("portfolioTabs");
  const previous = document.getElementById("portfolioPrev");
  const next = document.getElementById("portfolioNext");
  const hint = document.getElementById("portfolioHint");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, max = 1) => Math.max(0, Math.min(max, value));
  let active = -1;
  let top = 0;
  let start = 0;
  let travel = 0;
  let step = 0;
  let progress = 0;
  let queued = false;
  let resizing = false;
  let gesture = null;

  const buttons = slides.map((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.project = i;
    button.setAttribute("aria-controls", slide.id);
    button.setAttribute("aria-label", "Show " + slide.dataset.workTitle);
    const number = document.createElement("span");
    number.textContent = String(i + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");
    button.append(number, document.createTextNode(slide.dataset.workTitle));
    button.addEventListener("click", () => goTo(i, { manual: true }));
    tabs.append(button);
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.removeAttribute("aria-labelledby");
    slide.setAttribute(
      "aria-label",
      `${i + 1} of ${slides.length}: ${slide.dataset.workTitle}`,
    );
    return button;
  });

  function select(index) {
    if (active === index) return;
    const focus = document.activeElement;
    const leaving = slides[active];
    active = index;
    root.dataset.activeProject = index;
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      slide.setAttribute("aria-hidden", String(i !== index));
      buttons[i].setAttribute("aria-pressed", String(i === index));
    });
    if (leaving?.contains(focus)) buttons[index].focus({ preventScroll: true });
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    document.getElementById("portfolioCount").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    // Only move the project-tab strip; scrollIntoView would also move the page.
    const button = buttons[index];
    const buttonLeft =
      button.getBoundingClientRect().left -
      tabs.getBoundingClientRect().left +
      tabs.scrollLeft;
    if (
      buttonLeft < tabs.scrollLeft ||
      buttonLeft + button.offsetWidth > tabs.scrollLeft + tabs.clientWidth
    ) {
      tabs.scrollTo({
        left: Math.max(0, buttonLeft - 8),
        behavior: "instant",
      });
    }
    if (slides[index].id !== "creator") {
      document.getElementById("exVideo").pause();
      stopEmbeddedVideos();
    }
    document.dispatchEvent(
      new CustomEvent("portfoliochange", {
        detail: { index, id: slides[index].id },
      }),
    );
  }

  function render() {
    queued = false;
    if (root.dataset.mode === "scroll") {
      start = runway.getBoundingClientRect().top + scrollY - top;
      progress = travel ? clamp((scrollY - start) / travel) : 0;
      track.style.transform = `translate3d(${-progress * step * (slides.length - 1)}px, 0, 0)`;
    } else {
      progress =
        step && slides.length > 1
          ? clamp(viewport.scrollLeft / (step * (slides.length - 1)))
          : 0;
    }
    select(Math.round(progress * (slides.length - 1)));
    document.getElementById("portfolioProgress").style.transform =
      `scaleX(${(1 + progress * (slides.length - 1)) / slides.length})`;
    hint.firstChild.textContent =
      root.dataset.mode === "scroll"
        ? progress > 0.97
          ? "Keep scrolling "
          : "Scroll to explore "
        : "Swipe or choose ";
    hint.lastElementChild.textContent =
      root.dataset.mode === "scroll" ? "↓" : "↔";
  }

  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(render);
    }
  }

  function refresh() {
    resizing = false;
    const oldMode = root.dataset.mode;
    const oldStart = runway.getBoundingClientRect().top + scrollY - top;
    const inRunway =
      oldMode === "scroll" &&
      scrollY >= oldStart - 1 &&
      scrollY <= oldStart + travel + 1;
    const oldProgress = progress;
    const oldIndex = Math.max(0, active);
    const wasVisible =
      pin.getBoundingClientRect().top < innerHeight &&
      pin.getBoundingClientRect().bottom >
        document.getElementById("nav").getBoundingClientRect().bottom;
    top = document.getElementById("nav").getBoundingClientRect().height + 12;
    const height = Math.ceil(pin.getBoundingClientRect().height);
    const fits = height <= innerHeight - top - 12;
    const mode =
      !motion.matches && fits && slides.length > 1 ? "scroll" : "native";
    root.dataset.mode = mode;
    root.style.setProperty("--portfolio-top", top + "px");
    // Cap the vertical distance so future projects do not create a long page.
    travel = Math.min(
      (slides.length - 1) * Math.max(440, innerHeight * 0.7),
      innerHeight * 1.8,
    );
    root.style.setProperty("--portfolio-height", height + travel + "px");
    step = viewport.clientWidth + parseFloat(getComputedStyle(track).columnGap);
    start = runway.getBoundingClientRect().top + scrollY - top;
    if (mode === "native") {
      track.style.transform = "";
      viewport.scrollTo({
        left: Math.max(0, active) * step,
        behavior: "instant",
      });
    } else {
      viewport.scrollLeft = 0;
    }
    if (inRunway) {
      window.scrollTo({
        top: mode === "scroll" ? start + oldProgress * travel : start,
        behavior: "instant",
      });
    } else if (oldMode === "native" && mode === "scroll" && wasVisible) {
      window.scrollTo({
        top: start + (oldIndex / (slides.length - 1)) * travel,
        behavior: "instant",
      });
    }
    render();
  }

  function resize() {
    if (!resizing) {
      resizing = true;
      requestAnimationFrame(refresh);
    }
  }

  function goTo(
    index,
    { manual = false, bringIntoView = false, instant = false } = {},
  ) {
    index = clamp(index, slides.length - 1);
    const behavior = instant || motion.matches ? "instant" : "smooth";
    if (root.dataset.mode === "scroll") {
      start = runway.getBoundingClientRect().top + scrollY - top;
      window.scrollTo({
        top: start + (index / (slides.length - 1)) * travel,
        behavior,
      });
    } else {
      viewport.scrollTo({ left: index * step, behavior });
      if (bringIntoView)
        window.scrollTo({
          top: runway.getBoundingClientRect().top + scrollY - top,
          behavior,
        });
    }
    if (manual)
      document.getElementById("portfolioStatus").textContent =
        `${slides[index].dataset.workTitle}, project ${index + 1} of ${slides.length}.`;
    if (behavior === "instant") render();
  }

  previous.addEventListener("click", () => goTo(active - 1, { manual: true }));
  next.addEventListener("click", () => goTo(active + 1, { manual: true }));
  viewport.addEventListener("keydown", (event) => {
    if (event.target !== viewport) return;
    const targets = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key], { manual: true });
  });
  viewport.addEventListener("pointerdown", (event) => {
    if (
      root.dataset.mode !== "scroll" ||
      event.pointerType === "mouse" ||
      event.target.closest("a, button, video")
    )
      return;
    gesture = { x: event.clientX, y: event.clientY };
  });
  viewport.addEventListener("pointerup", (event) => {
    if (!gesture) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5)
      goTo(active + (dx < 0 ? 1 : -1), { manual: true });
  });
  viewport.addEventListener("pointercancel", () => {
    gesture = null;
  });
  viewport.addEventListener("scroll", schedule, { passive: true });
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", resize);
  motion.addEventListener("change", resize);
  new ResizeObserver(resize).observe(pin);
  document.fonts.ready.then(resize);
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) stopEmbeddedVideos();
  }).observe(root);

  function followHash(instant = false) {
    const index =
      location.hash === "#product"
        ? 0
        : slides.findIndex((slide) => "#" + slide.id === location.hash);
    if (index !== -1) goTo(index, { bringIntoView: true, instant });
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const index =
      link.getAttribute("href") === "#product"
        ? 0
        : slides.findIndex(
            (slide) => "#" + slide.id === link.getAttribute("href"),
          );
    if (index === -1) return;
    event.preventDefault();
    history.pushState(null, "", link.getAttribute("href"));
    goTo(index, { bringIntoView: true, manual: true });
  });
  addEventListener("hashchange", () => followHash());
  root.dataset.mode = "native";
  select(0);
  refresh();
  followHash(true);
})();
