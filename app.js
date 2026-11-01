"use strict";

const EMAIL = "hello@2founders.space";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

if (!reduce) document.documentElement.classList.add("anim");

/* ---------- The thread ----------
   One path through every [data-tp] marker in document order. Markers are
   positioned by CSS, so the path follows the layout at every width.
   data-loop  draws a small loop around the marker (radius = factor x font size)
   data-front lets the thread pass in front of the type at that point */
const thread = (() => {
  const svg = $("#threadOver");
  const back = $("#threadBack");
  const front = $("#threadFrontPath");
  const holes = $("#threadFrontHoles");
  const mask = $("#threadFront");
  const tip = $("#threadTip");
  let total = 0;
  let lens = [];
  let maxY = [];
  let shown = 0;
  let target = 0;
  let raf = 0;
  let intro = !reduce;

  const compact = () => innerWidth < 640;

  // A cursive curl: it enters along the incoming direction, turns once round
  // and leaves heading for the next marker, so the strands cross rather than
  // meeting in a V. The circle is kept inside the page.
  function curl(p, prev, next, rad) {
    const pageW = document.documentElement.clientWidth;
    const unit = (a, b) => {
      const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
    };
    const tin = unit(prev, p);
    let side = tin.x * (pageW / 2 - p.x) > 0 ? 1 : -1;
    if (Math.abs(tin.x) < 0.3) side = p.x > pageW / 2 ? 1 : -1;
    const c = { x: p.x - tin.y * side * rad, y: p.y + tin.x * side * rad };
    const shift = Math.min(0, pageW - 16 - (c.x + rad)) + Math.max(0, 16 - (c.x - rad));
    c.x += shift;
    const start = { x: p.x + shift, y: p.y };
    const a0 = Math.atan2(start.y - c.y, start.x - c.x);
    const dir = -Math.sin(a0) * tin.x + Math.cos(a0) * tin.y > 0 ? 1 : -1;
    // Exit where the circle's tangent points at the next marker.
    const tout = next ? unit(c, next) : tin;
    const aExit = dir > 0 ? Math.atan2(-tout.x, tout.y) : Math.atan2(tout.x, -tout.y);
    let sweep = (dir * (aExit - a0)) % (Math.PI * 2);
    if (sweep < 0) sweep += Math.PI * 2;
    if (sweep < Math.PI * 1.2) sweep += Math.PI * 2;
    const steps = Math.ceil((sweep / (Math.PI * 2)) * 12);
    const out = [start];
    for (let k = 1; k <= steps; k++) {
      const a = a0 + (dir * sweep * k) / steps;
      out.push({ x: c.x + Math.cos(a) * rad, y: c.y + Math.sin(a) * rad });
    }
    return out;
  }

  function markerPoints() {
    const raw = [];
    const fronts = [];
    for (const el of $$("[data-tp]")) {
      const r = el.getBoundingClientRect();
      const p = { x: r.left + scrollX, y: r.top + scrollY };
      const size = parseFloat(getComputedStyle(el.parentElement).fontSize) || 16;
      if (el.dataset.front !== undefined && !compact()) fronts.push({ ...p, r: Math.max(26, size * 0.36) });
      const loop = el.dataset.loop && !compact() ? size * parseFloat(el.dataset.loop) : 0;
      raw.push({ ...p, loop });
    }
    const pts = [];
    raw.forEach((p, i) => {
      if (p.loop && i > 0) pts.push(...curl(p, pts[pts.length - 1], raw[i + 1], p.loop));
      else pts.push({ x: p.x, y: p.y });
    });
    return { pts, fronts };
  }

  // Centripetal Catmull-Rom through the points, as cubic Beziers. Unlike the
  // uniform version it doesn't overshoot or kink where markers are unevenly spaced.
  function toPath(pts) {
    if (pts.length < 2) return "";
    const f = (n) => n.toFixed(1);
    const maxX = document.documentElement.clientWidth - 10;
    const fx = (n) => f(Math.min(maxX, Math.max(10, n)));
    const knot = (a, b) => Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y)) || 1e-4;
    let d = `M${fx(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p0 = pts[i - 1] || { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
      const p3 = pts[i + 2] || { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
      const d1 = knot(p0, p1);
      const d2 = knot(p1, p2);
      const d3 = knot(p2, p3);
      const c = (q0, q1, q2, a, b) =>
        (a * a * q2 - b * b * q0 + (2 * a * a + 3 * a * b + b * b) * q1) / (3 * a * (a + b));
      const c1x = c(p0.x, p1.x, p2.x, d1, d2);
      const c1y = c(p0.y, p1.y, p2.y, d1, d2);
      const c2x = c(p3.x, p2.x, p1.x, d3, d2);
      const c2y = c(p3.y, p2.y, p1.y, d3, d2);
      d += ` C${fx(c1x)} ${f(c1y)} ${fx(c2x)} ${f(c2y)} ${fx(p2.x)} ${f(p2.y)}`;
    }
    return d;
  }

  function build() {
    const { pts, fronts } = markerPoints();
    const d = toPath(pts);
    back.setAttribute("d", d);
    front.setAttribute("d", d);
    mask.setAttribute("x", 0);
    mask.setAttribute("y", 0);
    mask.setAttribute("width", document.documentElement.scrollWidth);
    mask.setAttribute("height", document.body.scrollHeight);
    holes.innerHTML = fronts
      .map((f) => `<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="${f.r.toFixed(1)}" fill="#fff"/>`)
      .join("");

    total = back.getTotalLength();
    lens = [];
    maxY = [];
    let m = -Infinity;
    for (let l = 0; l <= total; l += 6) {
      m = Math.max(m, back.getPointAtLength(l).y);
      lens.push(l);
      maxY.push(m);
    }
    for (const p of [back, front]) p.style.strokeDasharray = `${total} ${total}`;
    svg.classList.add("ready");
    update();
  }

  // Length of path whose furthest point so far reaches document y.
  function lengthAtY(y) {
    let lo = 0;
    let hi = maxY.length - 1;
    if (y >= maxY[hi]) return total;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (maxY[mid] < y) lo = mid + 1;
      else hi = mid;
    }
    return lens[lo];
  }

  function draw(len) {
    const off = Math.max(0, total - len);
    back.style.strokeDashoffset = off;
    front.style.strokeDashoffset = off;
    const pt = back.getPointAtLength(Math.min(len, total));
    tip.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  }

  function update() {
    if (!total) return;
    if (reduce) {
      shown = target = total;
      draw(total);
      return;
    }
    target = lengthAtY(scrollY + innerHeight * 0.72);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  let introStart = 0;
  function tick(now) {
    raf = 0;
    if (intro) {
      introStart ||= now;
      const t = Math.min(1, (now - introStart) / 1600);
      shown = target * (1 - Math.pow(2, -10 * t));
      if (t >= 1) intro = false;
    } else {
      shown += (target - shown) * 0.16;
      if (Math.abs(target - shown) < 0.5) shown = target;
    }
    draw(shown);
    if (intro || shown !== target) raf = requestAnimationFrame(tick);
  }

  return { build, update };
})();

let resizeTimer;
const rebuild = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(thread.build, 120);
};
addEventListener("scroll", thread.update, { passive: true });
addEventListener("resize", rebuild);
new ResizeObserver(rebuild).observe(document.body);
document.fonts?.ready.then(thread.build);
addEventListener("load", thread.build);

/* ---------- Line drawings ink in as they arrive ----------
   Web Animations rather than CSS transitions: Chromium can skip a
   stroke-dashoffset transition on shapes that carry pathLength. */
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
function inkIn(svg) {
  [...svg.children].forEach((el, i) => {
    const delay = i * 45;
    if (el.hasAttribute("pathLength")) {
      el.animate([{ strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0 }], {
        duration: 1300,
        delay,
        easing: EASE,
        fill: "backwards",
      });
    } else if (el.matches("text, .dash")) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 400 + delay, fill: "backwards" });
    }
  });
  svg.classList.add("in");
}
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          inkIn(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  $$(".draw").forEach((el) => io.observe(el));
} else {
  $$(".draw").forEach((el) => el.classList.add("in"));
}

/* ---------- Header ---------- */
const header = $(".site-header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Local time in India ---------- */
const clockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
});
const tickClock = () => {
  const t = `IST ${clockFmt.format(new Date())}`;
  $$("[data-clock]").forEach((el) => (el.textContent = t));
};
tickClock();
setInterval(tickClock, 30000);
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- ?c=Company personalisation (text only) ---------- */
const qs = new URLSearchParams(location.search);
const company = (qs.get("c") || qs.get("company") || "").trim().slice(0, 40);
if (company) {
  const heading = $("[data-company-heading]");
  if (heading) heading.textContent = `What should we build for ${company}?`;
  document.title = `${company} × 2 Founders`;
}

/* ---------- Enquiry: prepare an email in the visitor's own app ---------- */
const form = $("#enquiryForm");
const brief = $("#brief");
const briefError = $("#briefError");
const note = $("#formNote");
// With JS we show our own inline error; without it the browser's `required` check still applies.
form.noValidate = true;

brief.addEventListener("input", () => {
  if (brief.value.trim()) {
    brief.removeAttribute("aria-invalid");
    briefError.hidden = true;
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = brief.value.trim();
  if (!text) {
    brief.setAttribute("aria-invalid", "true");
    brief.setAttribute("aria-describedby", "briefError");
    briefError.hidden = false;
    brief.focus();
    return;
  }
  const need = new FormData(form).get("need");
  const timeline = $("#timeline").value;
  const subject = `Project brief: ${need}${company ? ` (${company})` : ""}`;
  const body = [
    `What we need: ${need}`,
    timeline ? `Timeline: ${timeline}` : "",
    "",
    text,
  ]
    .filter((line, i) => line || i === 2)
    .join("\n");
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const retry = document.createElement("a");
  retry.href = mailto;
  retry.id = "mailtoRetry";
  retry.textContent = "open it again";
  note.replaceChildren(
    "Your email app should open with the brief filled in. If it didn't, ",
    retry,
    ` or write to ${EMAIL}.`,
  );
  location.href = mailto;
});
