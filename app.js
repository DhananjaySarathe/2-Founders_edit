"use strict";

// Contact details and the existing 2 Founders video library.
const CONFIG = {
  email: "beyondthebuildofficial@gmail.com",
  whatsapp: "",
  bookingUrl: "",
  youtubeChannel: "https://www.youtube.com/@2Founders",
  work: {
    in: [
      {
        id: "mipDRH7hf60",
        title: "A short, built to hold attention.",
        tag: "Hindi Short / 01",
        description: "Hooks, pacing, captions, and sound from our own channel.",
      },
      {
        id: "Uo2umFjQyc8",
        title: "The same craft. A different story.",
        tag: "Hindi Short / 02",
        description: "Another example of our short-form editing work.",
      },
    ],
    global: [
      {
        id: "_w4H2c_K0EI",
        title: "Room for a longer story.",
        tag: "English / Long form",
        description:
          "A video from our own channel, with in-house pacing, graphics, captions, and sound.",
      },
    ],
  },
};
const qs = new URLSearchParams(location.search);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const company = (qs.get("c") || qs.get("company") || "").trim().slice(0, 40);
const $ = (id) => document.getElementById(id);
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
if (company) {
  $("forName").textContent = company;
  $("forChip").hidden = false;
  document.title = "2 Founders × " + company;
}
$("yr").textContent = new Date().getFullYear();
$("mailTxt").textContent = CONFIG.email;
$("mailTxt").href =
  `mailto:${CONFIG.email}?subject=${encodeURIComponent("AI automation" + (company ? " for " + company : ""))}`;

// Illustrated workflows. These steps explain the offer; they do not run a backend job.
const workflows = {
  creator: {
    path: "creator-engine",
    title: "Your channel. Your next three ideas.",
    kind: "Our creator workflow · illustrated",
    output: "3 daily ideas + an edit for your review",
    steps: [
      [
        "chart",
        "Audit the channel",
        "Understand the signals",
        "Start with an in-depth look at your channel to find patterns and decide what to make next.",
      ],
      [
        "bulb",
        "3 daily ideas",
        "Give direction to your day",
        "The idea engine recommends three ideas each day, informed by the channel audit. Choose the one you want to record.",
      ],
      [
        "camera",
        "You record",
        "Your voice. Your expertise.",
        "Bring the idea to camera. Your perspective stays yours; the workflow takes care of the work around it.",
      ],
      [
        "spark",
        "AI edit + review",
        "Bring the idea to life",
        "The AI editing workflow turns the footage into an edit with cuts, captions, graphics, and sound. You review before posting.",
      ],
    ],
  },
  research: {
    path: "audience-research",
    title: "Comments in. Audience insights out.",
    kind: "Liquid Signal · product walkthrough",
    output: "A searchable report + CSV / JSON export",
    steps: [
      [
        "search",
        "Pick a question",
        "Start with what you need",
        "In Liquid Signal, ask your own question or choose a suggested question about a YouTube audience.",
      ],
      [
        "doc",
        "Read comments",
        "A sample of public replies",
        "Liquid Signal analyzes a sample of public comments from the selected YouTube video.",
      ],
      [
        "chart",
        "Find the signal",
        "Answers, patterns, context",
        "Explore audience answer splits, a plain-language summary, purchase intent, barriers, and confidence.",
      ],
      [
        "folder",
        "Use the report",
        "Export your findings",
        "Search and filter the full report, then export CSV or JSON to use the findings in your next decision.",
      ],
    ],
  },
  custom: {
    path: "enquiry-to-action",
    title: "An enquiry. A clear next step.",
    kind: "Illustrative custom workflow",
    output: "An organised task + a draft reply",
    steps: [
      [
        "doc",
        "A new enquiry arrives",
        "Email, form, or your existing tool",
        "An example of a workflow we could build: an incoming request becomes the starting point, using the tools you already work in.",
      ],
      [
        "spark",
        "AI organises the details",
        "Extract the brief. Prepare the next step.",
        "The workflow could extract the request, organise key details, and prepare a task and draft reply using rules we agree with you.",
      ],
      [
        "shield",
        "You review what matters",
        "Approve the proposed action",
        "Review the proposed action and any draft that needs your judgment. The workflow moves forward at the checkpoints you approve.",
      ],
      [
        "check",
        "The work moves forward",
        "A task and draft reply in the right tools",
        "The agreed next action lands in the right tool: for example, a task for your team and a reply saved as a draft.",
      ],
    ],
  },
};
let scenario = "custom";
let activeStep = 0;
let walkthroughTimer = null;
function showStep(step) {
  activeStep = step;
  const entry = workflows[scenario].steps[step];
  $("workflowNodes")
    .querySelectorAll(".node")
    .forEach((node, i) =>
      node.setAttribute("aria-pressed", String(i === step)),
    );
  const strong = document.createElement("strong");
  strong.textContent = `${String(step + 1).padStart(2, "0")} / ${entry[1]}. `;
  $("workflowDetail").replaceChildren(
    strong,
    document.createTextNode(entry[3]),
  );
}
function stopWalkthrough() {
  clearInterval(walkthroughTimer);
  walkthroughTimer = null;
  $("walkthrough").setAttribute("aria-pressed", "false");
  $("walkthrough").querySelector("span").textContent = "Run walkthrough";
}
function setScenario(next) {
  stopWalkthrough();
  scenario = next;
  $("workflowPath").textContent = "2founders / " + workflows[next].path;
  $("workflowTitle").textContent = workflows[next].title;
  $("workflowKind").textContent = workflows[next].kind;
  $("workflowOutput").textContent = workflows[next].output;
  document
    .querySelectorAll("[data-scenario]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.scenario === next),
      ),
    );
  $("workflowNodes").innerHTML = workflows[next].steps
    .map(
      (step, i) =>
        `<button class="node" type="button" data-step="${i}" aria-pressed="${i === 0}"><span class="node-number">${String(i + 1).padStart(2, "0")}</span><span class="node-icon">${icon(step[0])}</span><b>${step[1]}</b><small>${step[2]}</small></button>`,
    )
    .join("");
  showStep(0);
}
document
  .querySelectorAll("[data-scenario]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      setScenario(button.dataset.scenario),
    ),
  );
$("workflowNodes").addEventListener("click", (event) => {
  const node = event.target.closest("[data-step]");
  if (node) {
    stopWalkthrough();
    showStep(Number(node.dataset.step));
  }
});
$("walkthrough").addEventListener("click", () => {
  if (walkthroughTimer) {
    stopWalkthrough();
    return;
  }
  showStep(0);
  $("walkthrough").setAttribute("aria-pressed", "true");
  $("walkthrough").querySelector("span").textContent = "Pause walkthrough";
  walkthroughTimer = setInterval(() => {
    if (activeStep === 3) {
      stopWalkthrough();
      return;
    }
    showStep(activeStep + 1);
  }, 2600);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopWalkthrough();
});

// Keep the original rotating accent, while the main company offer stays fixed.
(function initRotator() {
  const rot = $("rot");
  const words = [...rot.children];
  const fit = (word) => {
    rot.style.width = word.getBoundingClientRect().width + "px";
  };
  let i = 0;
  fit(words[0]);
  document.fonts.ready.then(() => fit(words[i]));
  addEventListener("resize", () => fit(words[i]));
  if (reduce) return;
  setInterval(() => {
    if (document.hidden) return;
    const old = words[i];
    i = (i + 1) % words.length;
    old.classList.remove("on");
    old.classList.add("out");
    words[i].classList.remove("out");
    words[i].classList.add("on");
    fit(words[i]);
    setTimeout(() => old.classList.remove("out"), 600);
  }, 2600);
})();

// Preserve the crossed marquees, now with the studio's automation positioning.
function fillMarquee(el, list) {
  const items = list.map((item) => `<span>${item}</span>`).join("");
  el.innerHTML = items.repeat(4);
}
fillMarquee($("mqA"), [
  "Agentic workflows",
  "AI automation",
  "Audience insights",
  "Creator engines",
]);
fillMarquee($("mqB"), [
  "Your tools, connected",
  "Less repetitive work",
  "Ideas to output",
  "Human judgment, built in",
]);

// Keep the existing region and company link parameters. Never override a manual language choice.
function stopEmbeddedVideos() {
  document.querySelectorAll(".work-frame iframe").forEach((frame) => {
    if (frame.videoFacade) frame.replaceWith(frame.videoFacade);
  });
}
let renderedRegion = null;
let regionChosen = false;
function normRegion(value) {
  value = (value || "").toLowerCase();
  if (["in", "india", "ind"].includes(value)) return "in";
  if (["global", "intl", "int", "world", "us", "row"].includes(value))
    return "global";
  return null;
}
function setRegion(region) {
  if (region === renderedRegion) return;
  stopEmbeddedVideos();
  renderedRegion = region;
  document.body.dataset.region = region;
  $("workIn").hidden = region !== "in";
  $("workGlobal").hidden = region !== "global";
  document
    .querySelectorAll(".region-tabs button")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.region === region),
      ),
    );
  renderWork(region);
}
function renderWork(region) {
  const grid = $(region === "in" ? "workIn" : "workGlobal");
  if (grid.dataset.done) return;
  grid.dataset.done = "true";
  for (const video of CONFIG.work[region]) {
    const article = document.createElement("article");
    article.className = "work-item" + (region === "global" ? " long-item" : "");
    article.innerHTML = `<div class="work-frame"><button class="video-facade" type="button" aria-label="Play ${video.tag}"><span class="play-icon">${icon("play")}</span></button></div><div class="work-copy"><span class="tag">${video.tag}</span><h4>${video.title}</h4><p>${video.description}</p><a class="text-link" href="https://youtu.be/${video.id}" target="_blank" rel="noopener">Watch on YouTube <span aria-hidden="true"><svg class="icon diagonal-arrow"><use href="#i-arrow"/></svg></span></a></div>`;
    const button = article.querySelector(".video-facade");
    button.style.backgroundImage = `url("https://i.ytimg.com/vi/${video.id}/${region === "in" ? "hqdefault" : "maxresdefault"}.jpg")`;
    button.addEventListener("click", () => {
      if (location.protocol === "file:") {
        window.open(`https://youtu.be/${video.id}`, "_blank", "noopener");
        return;
      }
      $("exVideo").pause();
      stopEmbeddedVideos();
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0`;
      iframe.title = video.tag;
      iframe.videoFacade = button;
      iframe.allow =
        "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
      iframe.addEventListener("load", () => iframe.focus(), { once: true });
    });
    grid.appendChild(article);
  }
}
document.querySelectorAll(".region-tabs button").forEach((button) =>
  button.addEventListener("click", () => {
    regionChosen = true;
    setRegion(button.dataset.region);
    const url = new URL(location.href);
    url.searchParams.set("r", button.dataset.region);
    history.replaceState(null, "", url);
  }),
);
(function initRegion() {
  const forced = normRegion(qs.get("r") || qs.get("region"));
  if (forced) {
    setRegion(forced);
    return;
  }
  let guessed = "global";
  try {
    if (
      /^Asia\/(Kolkata|Calcutta)$/.test(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
    )
      guessed = "in";
  } catch {}
  setRegion(guessed);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  fetch("api/geo", { signal: controller.signal, cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!regionChosen && data && data.country)
        setRegion(data.country.toUpperCase() === "IN" ? "in" : "global");
    })
    .catch(() => {})
    .finally(() => clearTimeout(timeout));
})();

// Self-hosted sample: muted playback in view, user-controlled audio and native controls.
(function initExample() {
  const video = $("exVideo");
  video.addEventListener("timeupdate", () => {
    if (video.duration)
      $("vprog").style.width = `${(video.currentTime / video.duration) * 100}%`;
  });
  let soundEnabled = false;
  video.addEventListener("play", stopEmbeddedVideos);
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!reduce && !soundEnabled) video.play().catch(() => {});
    },
    { threshold: 0.45 },
  ).observe(video);
  $("exSound").addEventListener("click", () => {
    soundEnabled = true;
    video.muted = false;
    video.loop = false;
    video.currentTime = 0;
    video
      .play()
      .then(() => {
        $("exSound").hidden = true;
      })
      .catch(() => {
        video.controls = true;
      });
  });
})();

// Service-specific enquiry links prepare a real email, without a fake submission success.
document.querySelectorAll("[data-enquiry]").forEach((link) =>
  link.addEventListener("click", () => {
    $("enquiryType").value = link.dataset.enquiry;
    if (link.dataset.brief && !$("enquiryTask").value.trim()) {
      $("enquiryTask").value = link.dataset.brief;
      $("enquiryTask").setCustomValidity("");
    }
    $("formStatus").hidden = true;
  }),
);
const enquiryLabels = {
  custom: "Custom automation",
  service: "Focused AI service",
  creator: "Creator workflow",
  explore: "Explore automation",
};
$("enquiryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const task = $("enquiryTask").value.trim();
  if (!task) {
    $("enquiryTask").setCustomValidity(
      "Tell us a little about the work you want help with.",
    );
    $("enquiryTask").reportValidity();
    return;
  }
  const choice = enquiryLabels[$("enquiryType").value];
  const tools = $("enquiryTools").value.trim();
  const subject = choice + (company ? " for " + company : " enquiry");
  const brief = `Hi 2 Founders,\n\nI'm interested in: ${choice}\n${company ? "Company: " + company + "\n" : ""}\nWhat I need help with:\n${task}\n${tools ? "\nTools I use: " + tools + "\n" : ""}\nThanks!`;
  const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
  const status = $("formStatus");
  status.replaceChildren(
    document.createTextNode(
      "Your brief is ready for your email app. If it does not open, copy the brief and email us directly.",
    ),
  );
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "text-link";
  copy.style.cssText =
    "background:none;border:0;color:#fff;margin-top:9px;display:block;text-decoration:underline;font-size:11px";
  copy.textContent = "Copy my brief";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(brief);
      copy.textContent = "Brief copied";
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = brief;
      fallback.readOnly = true;
      fallback.setAttribute("aria-label", "Your email brief — select and copy");
      status.appendChild(fallback);
      fallback.focus();
      fallback.select();
      copy.textContent = "Select and copy the brief below";
      copy.disabled = true;
    }
  });
  const retry = document.createElement("a");
  retry.href = mailto;
  retry.target = "_blank";
  retry.rel = "noopener";
  retry.textContent = "Open email app again";
  status.append(copy, retry);
  status.hidden = false;
  // Keep the prepared brief visible if no email handler is installed.
  window.open(mailto, "_blank", "noopener");
});
$("enquiryTask").addEventListener("input", () => {
  $("enquiryTask").setCustomValidity("");
  $("formStatus").hidden = true;
});
$("enquiryTools").addEventListener("input", () => {
  $("formStatus").hidden = true;
});
$("enquiryType").addEventListener("change", () => {
  $("formStatus").hidden = true;
});

// Original scroll progress, tilt, reveals, and contextual mobile CTA.
let scheduled = false;
function onScroll() {
  scheduled = false;
  const y = scrollY;
  $("nav").classList.toggle("scrolled", y > 8);
  const max = document.documentElement.scrollHeight - innerHeight;
  $("progress").style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (!reduce) {
    const progress = Math.min(1, y / (innerHeight * 0.45));
    $("workflowBoard").style.setProperty("--tilt", `${5 * (1 - progress)}deg`);
    $("workflowBoard").style.setProperty(
      "--sc",
      (0.98 + 0.02 * progress).toFixed(3),
    );
  }
  $("mbar").classList.toggle(
    "show",
    y > innerHeight * 0.9 &&
      $("talk").getBoundingClientRect().top > innerHeight * 0.8,
  );
}
addEventListener(
  "scroll",
  () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
addEventListener("resize", onScroll);
onScroll();
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.1 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));
