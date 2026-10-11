"use strict";

// Contact details and the existing 2 Founders video library.
const CONFIG = {
  email: "beyondthebuildofficial@gmail.com",
  // Optional: WhatsApp number with country code and no "+", e.g. "919876543210".
  whatsapp: "",
  // Optional: a Calendly or Cal.com link, shown beside the enquiry form.
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
const pad = (n) => String(n).padStart(2, "0");
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
if (company) {
  $("forName").textContent = company;
  $("forChip").hidden = false;
  document.title = "2 Founders × " + company;
  const name = document.createElement("span");
  name.className = "hl";
  name.textContent = company + "?";
  $("talk-heading").replaceChildren(
    "What should we",
    document.createElement("br"),
    "automate for ",
    name,
  );
}
$("yr").textContent = new Date().getFullYear();
$("mailTxt").textContent = CONFIG.email;
$("mailTxt").href =
  `mailto:${CONFIG.email}?subject=${encodeURIComponent("AI automation" + (company ? " for " + company : ""))}`;

// Illustrated workflows. These steps explain the offer; they do not run a backend job.
const workflows = {
  creator: {
    path: "creator-engine",
    label: "Creator engine",
    title: "Your channel. Your next three ideas.",
    kind: "Our creator workflow · illustrated",
    output: "3 daily ideas + an edit for your review",
    steps: [
      [
        "chart",
        "Audit the channel",
        "Understand the signals",
        "Find the channel patterns that guide what to make next.",
      ],
      [
        "bulb",
        "3 daily ideas",
        "Give direction to your day",
        "Choose from three daily ideas informed by your channel audit.",
      ],
      [
        "camera",
        "You record",
        "Your voice. Your expertise.",
        "Record the idea in your own voice.",
      ],
      [
        "spark",
        "AI edit + review",
        "Bring the idea to life",
        "Cuts, captions, graphics, and sound. You review before posting.",
      ],
    ],
  },
  research: {
    path: "audience-research",
    label: "Audience research",
    title: "Comments in. Audience insights out.",
    kind: "Liquid Signal · product walkthrough",
    output: "A searchable report + CSV / JSON export",
    steps: [
      [
        "search",
        "Pick a question",
        "Start with what you need",
        "Ask your own audience question or choose a suggested one.",
      ],
      [
        "doc",
        "Read comments",
        "A sample of public replies",
        "Analyze sampled public comments from the selected video.",
      ],
      [
        "chart",
        "Find the signal",
        "Answers, patterns, context",
        "Explore answer splits, audience intent, barriers, and confidence.",
      ],
      [
        "folder",
        "Use the report",
        "Export your findings",
        "Search, filter, and export the findings as CSV or JSON.",
      ],
    ],
  },
  custom: {
    path: "enquiry-to-action",
    label: "Business admin",
    title: "An enquiry. A clear next step.",
    kind: "Illustrative custom workflow",
    output: "An organised task + a draft reply",
    steps: [
      [
        "doc",
        "A new enquiry arrives",
        "Email, form, or your existing tool",
        "A workflow we could build around requests in your existing tools.",
      ],
      [
        "spark",
        "AI organises the details",
        "Extract the brief. Prepare the next step.",
        "Extract the brief and prepare a task and draft reply.",
      ],
      [
        "shield",
        "You review what matters",
        "Approve the proposed action",
        "Approve the proposed action at your agreed review point.",
      ],
      [
        "check",
        "Task + reply draft",
        "A task and draft reply in the right tools",
        "A task for your team. A reply saved as a draft.",
      ],
    ],
  },
};
// Each stage carries a small illustrated artifact: the default ones ship in the page.
const artifacts = {
  custom: [...$("workflowNodes").querySelectorAll(".artifact")].map((art) =>
    art.cloneNode(true),
  ),
  research: [...$("art-research").content.children],
  creator: [...$("art-creator").content.children],
};
let scenario = "custom";
let activeStep = 0;
let walkthroughTimer = null;
let boardInView = false;
// Once a visitor picks a stage or pauses, the board stops playing on its own.
let manualControl = false;
function showStep(step) {
  activeStep = step;
  const entry = workflows[scenario].steps[step];
  $("workflowNodes")
    .querySelectorAll(".node")
    .forEach((node, i) => {
      node.setAttribute("aria-pressed", String(i === step));
      node.classList.toggle("is-done", i < step);
    });
  const strong = document.createElement("strong");
  strong.textContent = `${pad(step + 1)} / ${entry[1]}. `;
  $("workflowDetail").replaceChildren(
    strong,
    document.createTextNode(entry[3]),
  );
}
function setWalkthroughButton(playing) {
  const button = $("walkthrough");
  button.setAttribute("aria-pressed", String(playing));
  button.querySelector("span").textContent = playing
    ? "Pause walkthrough"
    : "Run walkthrough";
  button
    .querySelector("use")
    .setAttribute("href", playing ? "#i-pause" : "#i-play");
}
function stopWalkthrough() {
  clearTimeout(walkthroughTimer);
  walkthroughTimer = null;
  setWalkthroughButton(false);
}
function startWalkthrough(fromStart = true) {
  stopWalkthrough();
  if (fromStart) showStep(0);
  setWalkthroughButton(true);
  const tick = () => {
    const next = activeStep === 3 ? 0 : activeStep + 1;
    showStep(next);
    walkthroughTimer = setTimeout(tick, next === 3 ? 4200 : 2600);
  };
  walkthroughTimer = setTimeout(tick, activeStep === 3 ? 4200 : 2600);
}
function setScenario(next) {
  stopWalkthrough();
  scenario = next;
  $("workflowPath").textContent = workflows[next].label;
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
  $("workflowNodes").replaceChildren(
    ...workflows[next].steps.map((step, i) => {
      const node = document.createElement("button");
      node.className = "node";
      node.type = "button";
      node.dataset.step = i;
      node.setAttribute("aria-pressed", String(i === 0));
      node.innerHTML = `<span class="node-number">${pad(i + 1)}</span><span class="node-icon">${icon(step[0])}</span><b>${step[1]}</b>`;
      node.append(artifacts[next][i].cloneNode(true));
      return node;
    }),
  );
  showStep(0);
}
document.querySelectorAll("[data-scenario]").forEach((button) =>
  button.addEventListener("click", () => {
    manualControl = true;
    setScenario(button.dataset.scenario);
  }),
);
$("workflowNodes").addEventListener("click", (event) => {
  const node = event.target.closest("[data-step]");
  if (node) {
    manualControl = true;
    stopWalkthrough();
    showStep(Number(node.dataset.step));
  }
});
$("walkthrough").addEventListener("click", () => {
  if (walkthroughTimer) {
    manualControl = true;
    stopWalkthrough();
    return;
  }
  manualControl = false;
  startWalkthrough(true);
});
// The board plays like a short film while it is on screen.
new IntersectionObserver(
  ([entry]) => {
    boardInView = entry.isIntersecting;
    if (!boardInView) stopWalkthrough();
    else if (!reduce && !manualControl && !walkthroughTimer)
      startWalkthrough(false);
  },
  { threshold: 0.45 },
).observe($("workflowBoard"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopWalkthrough();
  else if (boardInView && !reduce && !manualControl) startWalkthrough(false);
});

// The rotating word fits its current width; CSS reserves the widest word without JavaScript.
(function initRotator() {
  const rot = $("rot");
  const words = [...rot.children];
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let i = 0;
  function fit(animate) {
    const style = getComputedStyle(rot);
    const inline =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    if (!animate) rot.style.transition = "none";
    rot.style.width = `${Math.ceil(words[i].getBoundingClientRect().width + inline)}px`;
    if (!animate) {
      void rot.offsetWidth;
      rot.style.transition = "";
    }
  }
  fit(false);
  if (document.fonts) {
    document.fonts.ready.then(() => fit(false));
    document.fonts.addEventListener("loadingdone", () => fit(false));
  }
  addEventListener("resize", () => fit(false));
  setInterval(() => {
    if (document.hidden || motionPreference.matches) return;
    const old = words[i];
    i = (i + 1) % words.length;
    old.classList.remove("on");
    old.classList.add("out");
    words[i].classList.remove("out");
    words[i].classList.add("on");
    fit(true);
    setTimeout(() => old.classList.remove("out"), 600);
  }, 2600);
})();

// The crossed marquees name finished work and the way it gets done.
function fillMarquee(el, list) {
  const items = list.map((item) => `<span>${item}</span>`).join("");
  el.innerHTML = items.repeat(4);
}
fillMarquee($("mqA"), [
  "Enquiries sorted",
  "Reports drafted",
  "Comments read",
  "Ideas found",
  "Edits ready",
]);
fillMarquee($("mqB"), [
  "Speed from AI",
  "Taste from people",
  "Your tools, connected",
  "Review points built in",
]);

// Your week: an estimate built from the visitor's own numbers. Nothing leaves the page.
const meter = (function initMeter() {
  const tasks = [
    ["enquiries", "Answering the same enquiries", 2, true],
    ["copying", "Copying data between tools", 2, false],
    ["reports", "Putting together reports", 2, true],
    ["research", "Researching what to make next", 2, false],
    ["comments", "Reading comments and feedback", 2, false],
    ["editing", "Editing and repurposing videos", 3, false],
    ["followups", "Chasing follow-ups", 2, false],
  ].map(([id, label, hours, on]) => ({ id, label, hours, on }));
  const box = document.querySelector(".meter");
  const list = $("meterTasks");
  const slots = [];
  let handed = false;
  const counting = {};
  list.replaceChildren(
    ...tasks.map((task) => {
      const row = document.createElement("li");
      row.className = "task-row";
      row.innerHTML = `<button class="task" type="button" aria-pressed="false"><span class="task-check" aria-hidden="true"></span><span></span></button><span class="task-hours"><button class="hrs" type="button" data-delta="-1">−</button><output></output><button class="hrs" type="button" data-delta="1">+</button></span>`;
      row.querySelector(".task span:last-child").textContent = task.label;
      const [less, more] = row.querySelectorAll(".hrs");
      less.setAttribute("aria-label", `Fewer hours: ${task.label}`);
      more.setAttribute("aria-label", `More hours: ${task.label}`);
      row
        .querySelector("output")
        .setAttribute("aria-label", `Hours a week: ${task.label}`);
      row.querySelector(".task").addEventListener("click", () => {
        task.on = !task.on;
        update();
      });
      row.querySelectorAll(".hrs").forEach((button) =>
        button.addEventListener("click", () => {
          task.hours = clamp(task.hours + Number(button.dataset.delta), 1, 20);
          update();
        }),
      );
      task.row = row;
      return row;
    }),
  );
  // Fill hour by hour across the days, so repeat work shows up all week.
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  $("weekGrid").replaceChildren(
    ...days.map((day, d) => {
      const row = document.createElement("div");
      row.className = "wk-row";
      const label = document.createElement("span");
      label.className = "wk-day";
      label.textContent = day.toUpperCase();
      row.append(label);
      for (let h = 0; h < 8; h++) {
        const slot = document.createElement("span");
        slot.className = "wk-slot";
        const order = h * days.length + d;
        slot.style.setProperty("--d", `${(order * 0.018).toFixed(3)}s`);
        slots[order] = slot;
        row.append(slot);
      }
      return row;
    }),
  );
  function count(id, value) {
    const el = $(id);
    const from = Number(el.textContent) || 0;
    cancelAnimationFrame(counting[id]);
    if (reduce || from === value) {
      el.textContent = value;
      return;
    }
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / 450);
      el.textContent = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      if (t < 1) counting[id] = requestAnimationFrame(frame);
    };
    counting[id] = requestAnimationFrame(frame);
  }
  function total() {
    return tasks.reduce((sum, task) => sum + (task.on ? task.hours : 0), 0);
  }
  function update() {
    const hours = total();
    for (const task of tasks) {
      task.row.classList.toggle("is-on", task.on);
      task.row
        .querySelector(".task")
        .setAttribute("aria-pressed", String(task.on));
      task.row.querySelector("output").textContent = `${task.hours}h`;
      const [less, more] = task.row.querySelectorAll(".hrs");
      less.disabled = task.hours <= 1;
      more.disabled = task.hours >= 20;
    }
    slots.forEach((slot, i) => {
      const repeat = i < hours;
      slot.classList.toggle("is-repeat", repeat && !handed);
      slot.classList.toggle("is-handed", repeat && handed);
    });
    box.classList.toggle("is-handed", handed);
    count("weekHours", hours);
    count("weekYear", hours * 48);
    count("weekWeeks", Math.round((hours * 48) / 40));
    let message;
    if (!hours) message = "Tick anything you do more than once a week.";
    else if (handed)
      message =
        "That's the time we'd go after first. Some of it automates cleanly, some needs a person. We'll tell you which is which.";
    else if (hours > 40)
      message =
        "That's more than a full working week of repeat work. Let's talk.";
    else
      message = `${hours} hour${hours === 1 ? "" : "s"} of your week go${hours === 1 ? "es" : ""} to work you've done before.`;
    $("weekMsg").textContent = message;
  }
  $("handOff").addEventListener("click", () => {
    handed = !handed;
    $("handOff").setAttribute("aria-pressed", String(handed));
    update();
  });
  update();
  return {
    brief() {
      const picked = tasks.filter((task) => task.on);
      if (!picked.length)
        return "I'd like to automate some repetitive work. Today we manually… The result we need is…";
      const lines = picked.map(
        (task) => `- ${task.label}: about ${task.hours}h a week`,
      );
      return `The repeat work I'd like help with:\n${lines.join("\n")}\n\nThat's roughly ${total()} hours a week. Which parts are worth automating?`;
    },
  };
})();

// Keep the existing region and company link parameters. Never override a manual language choice.
function stopEmbeddedVideos() {
  document.querySelectorAll(".work-frame iframe").forEach((frame) => {
    if (frame.videoFacade) frame.replaceWith(frame.videoFacade);
  });
}
$("work").addEventListener("toggle", () => {
  if (!$("work").open) stopEmbeddedVideos();
});
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
  renderContactOptions();
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
// Optional WhatsApp and booking links appear only when CONFIG provides them.
function renderContactOptions() {
  const options = [];
  if (CONFIG.whatsapp) {
    const text = `Hi 2 Founders, I'd like to talk about automation${company ? " for " + company : ""}.`;
    options.push([
      "Message on WhatsApp",
      `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`,
    ]);
  }
  if (CONFIG.bookingUrl) options.push(["Book a call", CONFIG.bookingUrl]);
  if (renderedRegion !== "in") options.reverse();
  $("ctaExtra").replaceChildren(
    ...options.map(([label, href]) => {
      const link = document.createElement("a");
      link.className = "btn btn-ghost btn-sm";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = label;
      return link;
    }),
  );
  $("ctaExtra").hidden = !options.length;
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

// Product demos play once when they scroll into view.
function play(el) {
  if (reduce) return;
  el.classList.remove("is-playing");
  void el.offsetWidth;
  el.classList.add("is-playing");
}
for (const id of ["lsDemo", "creatorSteps"])
  new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return;
      play(entry.target);
      observer.disconnect();
    },
    { threshold: 0.35 },
  ).observe($(id));

// Service-specific enquiry links prepare a real email, without a fake submission success.
let lastAutoBrief = "";
function fillBrief(text, type) {
  const field = $("enquiryTask");
  const current = field.value.trim();
  if (type) $("enquiryType").value = type;
  if (!current || current === lastAutoBrief.trim()) field.value = text;
  else if (!current.includes(text.trim()))
    field.value = `${current}\n\n${text}`;
  lastAutoBrief = text;
  field.setCustomValidity("");
  $("formStatus").hidden = true;
  field.classList.remove("is-filled");
  void field.offsetWidth;
  field.classList.add("is-filled");
}
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
$("weekBrief").addEventListener("click", () =>
  fillBrief(meter.brief(), "explore"),
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

// The guide: chapter progress, a jump menu, and the optional 60-second tour.
const chapters = [...document.querySelectorAll("[data-chapter]")];
const chapterHref = (el) => (el.id === "top" ? "#automate" : `#${el.id}`);
let chapterIndex = -1;
$("guideChapters").replaceChildren(
  ...chapters.map((el, i) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = chapterHref(el);
    const number = document.createElement("span");
    number.textContent = pad(i + 1);
    link.append(number, el.dataset.chapter);
    link.addEventListener("click", () => toggleGuide(false));
    item.append(link);
    return item;
  }),
);
$("guide").hidden = false;
function toggleGuide(open) {
  $("guideMenu").hidden = !open;
  $("guideToggle").setAttribute("aria-expanded", String(open));
}
$("guideToggle").addEventListener("click", () =>
  toggleGuide($("guideMenu").hidden),
);
document.addEventListener("click", (event) => {
  if (!$("guideMenu").hidden && !$("guide").contains(event.target))
    toggleGuide(false);
});
function updateChapter() {
  let current = 0;
  chapters.forEach((el, i) => {
    if (el.getBoundingClientRect().top <= innerHeight * 0.45) current = i;
  });
  if (current === chapterIndex) return;
  chapterIndex = current;
  $("guideCount").textContent = `${pad(current + 1)}/${pad(chapters.length)}`;
  $("guideLabel").textContent = chapters[current].dataset.chapter;
  $("guideChapters")
    .querySelectorAll("a")
    .forEach((link, i) =>
      link.setAttribute("aria-current", String(i === current)),
    );
}

const tour = (function initTour() {
  const STEP_MS = 9000;
  const steps = [
    {
      target: "automate",
      title: "What we do",
      text: `${company ? `Hi, ${company} team. ` : ""}This is a workflow we could build. An enquiry comes in, AI sorts it, you approve, and the work moves on. It's running now.`,
      enter() {
        manualControl = false;
        startWalkthrough(true);
      },
    },
    {
      target: "week",
      title: "Your turn",
      text: "Tick the work you repeat and set rough hours. We'll add up what it costs you, then turn it into a brief.",
    },
    {
      target: "about",
      title: "Who we are",
      text: "Two founders who make videos and build AI workflows. AI brings the speed, people bring the taste. We combined both.",
    },
    {
      target: "product",
      title: "What we've built",
      text: "Liquid Signal is on the Chrome Web Store. The creator engine is our own content workflow.",
      enter: () => play($("lsDemo")),
    },
    {
      target: "services",
      title: "Two ways in",
      text: "We build the workflow and hand it over, or we just deliver the result: one-off, recurring, or usage-based.",
    },
    {
      target: "talk",
      title: "Your move",
      text: "Tell us one task you'd like gone. The form opens your email app, and nothing is stored here.",
    },
  ];
  const card = $("tour");
  let index = -1;
  let paused = reduce;
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let typing = 0;
  let opener = null;
  function type(text) {
    clearTimeout(typing);
    $("tourLive").textContent = text;
    if (reduce) {
      $("tourText").textContent = text;
      return;
    }
    let shown = 0;
    const step = () => {
      shown = Math.min(text.length, shown + 3);
      $("tourText").textContent = text.slice(0, shown);
      if (shown < text.length) typing = setTimeout(step, 18);
    };
    step();
  }
  function setPlayButton() {
    const button = $("tourPlay");
    button.setAttribute("aria-pressed", String(!paused));
    button
      .querySelector("use")
      .setAttribute("href", paused ? "#i-play" : "#i-pause");
    button.querySelector(".sr-only").textContent = paused
      ? "Play tour"
      : "Pause tour";
  }
  function tick(now) {
    if (paused || index < 0) return;
    elapsed += now - last;
    last = now;
    const progress = Math.min(1, elapsed / STEP_MS);
    $("tourBar").style.width = `${progress * 100}%`;
    if (progress < 1) frame = requestAnimationFrame(tick);
    else if (index < steps.length - 1) go(index + 1);
    else pause();
  }
  function run() {
    cancelAnimationFrame(frame);
    if (paused) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    paused = true;
    cancelAnimationFrame(frame);
    setPlayButton();
  }
  function go(next) {
    document
      .querySelectorAll("[data-tour-active]")
      .forEach((el) => el.removeAttribute("data-tour-active"));
    index = next;
    const step = steps[index];
    const target = $(step.target);
    target.setAttribute("data-tour-active", "");
    $("tourCount").textContent = `${pad(index + 1)} / ${pad(steps.length)}`;
    $("tourTitle").textContent = step.title;
    type(step.text);
    $("tourBack").disabled = index === 0;
    $("tourNext").textContent =
      index === steps.length - 1 ? "Write my brief" : "Next";
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    if (step.enter) step.enter();
    elapsed = 0;
    $("tourBar").style.width = "0";
    run();
  }
  function open(from) {
    opener = from || document.activeElement;
    paused = reduce;
    setPlayButton();
    toggleGuide(false);
    document.body.classList.add("touring");
    card.hidden = false;
    go(0);
    card.focus({ preventScroll: true });
  }
  function close(returnFocus = true) {
    if (index < 0) return;
    cancelAnimationFrame(frame);
    clearTimeout(typing);
    index = -1;
    card.hidden = true;
    document.body.classList.remove("touring");
    document
      .querySelectorAll("[data-tour-active]")
      .forEach((el) => el.removeAttribute("data-tour-active"));
    if (returnFocus && opener && document.contains(opener))
      opener.focus({ preventScroll: true });
  }
  $("tourStart").addEventListener("click", (event) =>
    open(event.currentTarget),
  );
  $("guideTour").addEventListener("click", () => open($("guideToggle")));
  $("tourClose").addEventListener("click", () => close());
  $("tourBack").addEventListener("click", () => index > 0 && go(index - 1));
  $("tourNext").addEventListener("click", () => {
    if (index < steps.length - 1) {
      go(index + 1);
      return;
    }
    close(false);
    $("enquiryTask").focus();
  });
  $("tourPlay").addEventListener("click", () => {
    if (paused) {
      paused = false;
      setPlayButton();
      if (elapsed >= STEP_MS && index < steps.length - 1) go(index + 1);
      else run();
    } else pause();
  });
  // Scrolling or jumping by hand means the visitor has taken over; the tour waits for them.
  for (const kind of ["wheel", "touchmove"])
    addEventListener(kind, () => index >= 0 && !paused && pause(), {
      passive: true,
    });
  document.addEventListener("click", (event) => {
    if (index >= 0 && !paused && !card.contains(event.target))
      if (event.target.closest('a[href^="#"]')) pause();
  });
  document.addEventListener("keydown", (event) => {
    if (index < 0) {
      if (event.key === "Escape" && !$("guideMenu").hidden) {
        toggleGuide(false);
        $("guideToggle").focus();
      }
      return;
    }
    if (event.key === "Escape") {
      close();
      return;
    }
    if (card.contains(document.activeElement)) {
      if (event.key === "ArrowRight" && index < steps.length - 1) go(index + 1);
      if (event.key === "ArrowLeft" && index > 0) go(index - 1);
    } else if (
      [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        " ",
        "Home",
        "End",
      ].includes(event.key)
    )
      pause();
  });
  return { open, close, isOpen: () => index >= 0 };
})();

// Original scroll progress, tilt, reveals, and contextual mobile CTA, plus the story progress.
const aboutPath = $("aboutPath");
const pathSteps = [...aboutPath.children];
const processSteps = [...$("processSteps").children];
const processStates = [
  [0.05, "● Waiting for your task"],
  [0.28, "● Mapping the work"],
  [0.53, "● Agreeing the scope"],
  [0.78, "● Building & testing"],
  [0.97, "● In your review"],
  [Infinity, "✓ Up and running"],
];
function updateStory() {
  const r = aboutPath.getBoundingClientRect();
  const p = reduce ? 1 : clamp((innerHeight * 0.72 - r.top) / r.height, 0, 1);
  aboutPath.style.setProperty("--p", p.toFixed(3));
  pathSteps.forEach((step, i) =>
    step.classList.toggle(
      "is-reached",
      p > 0 && p >= i / (pathSteps.length - 1) - 0.001,
    ),
  );
  const board = $("processBoard").getBoundingClientRect();
  const t = reduce
    ? 1
    : clamp(
        (innerHeight * 0.85 - board.top) / (board.height + innerHeight * 0.2),
        0,
        1,
      );
  $("playhead").style.left = `${t * 100}%`;
  $("processFill").style.width = `${t * 100}%`;
  processSteps.forEach((step, i) =>
    step.classList.toggle("lit", t > (i + 0.1) / processSteps.length),
  );
  const status = processStates.find(([limit]) => t < limit)[1];
  if ($("processStatus").textContent !== status) {
    $("processStatus").textContent = status;
    $("processStatus").classList.toggle("is-done", t >= 0.97);
  }
}
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
  $("guide").classList.toggle(
    "show",
    y > innerHeight * 0.6 && innerWidth > 700 && !tour.isOpen(),
  );
  updateChapter();
  updateStory();
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
