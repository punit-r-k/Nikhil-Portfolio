document.documentElement.classList.add("js");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function closeNavigation() {
  if (!navToggle) return;
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    if (isOpen) {
      requestAnimationFrame(() => siteNav.querySelector("a")?.focus());
    }
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNavigation();
      navToggle.focus();
    }

    if (event.key === "Tab" && document.body.classList.contains("nav-open")) {
      const focusableItems = [navToggle, ...siteNav.querySelectorAll("a")];
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeNavigation();
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelectorAll("h1, h2, h3").forEach((heading) => {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (let index = textNodes.length - 1; index >= 0; index -= 1) {
    const node = textNodes[index];
    if (!node.textContent.trim()) continue;
    node.textContent = node.textContent.replace(/\.\s*$/, "");
    break;
  }
});

const worksViewButtons = document.querySelectorAll("[data-works-view]");
const worksPanels = document.querySelectorAll("[data-works-panel]");

worksViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedView = button.dataset.worksView;
    worksViewButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    worksPanels.forEach((panel) => {
      panel.hidden = panel.dataset.worksPanel !== selectedView;
    });
  });
});

const formatAudioTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

document.querySelectorAll("[data-audio-player]").forEach((player) => {
  const audio = player.querySelector("audio");
  const toggle = player.querySelector(".audio-player__toggle");
  const toggleIcon = toggle.querySelector("span");
  const seek = player.querySelector("[data-audio-seek]");
  const currentTime = player.querySelector("[data-audio-current]");
  const duration = player.querySelector("[data-audio-duration]");

  const updateToggle = () => {
    const isPlaying = !audio.paused;
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} Dreams of Flight`);
    toggleIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  const updateDuration = () => {
    duration.textContent = formatAudioTime(audio.duration);
  };

  audio.addEventListener("loadedmetadata", updateDuration);
  audio.addEventListener("durationchange", updateDuration);

  audio.addEventListener("timeupdate", () => {
    currentTime.textContent = formatAudioTime(audio.currentTime);
    seek.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : "0";
  });

  seek.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  audio.addEventListener("play", updateToggle);
  audio.addEventListener("pause", updateToggle);
  audio.addEventListener("ended", updateToggle);
  if (audio.readyState >= 1) updateDuration();
  updateToggle();
});

const scoreSource = document.body.dataset.scoreSrc;
const scoreSlot = document.querySelector(".score-slot");

if (scoreSource && scoreSlot && window.location.protocol !== "file:") {
  fetch(scoreSource, { method: "HEAD" })
    .then((response) => {
      if (!response.ok) return;

      const scoreTitle = document.title.split(" — ")[0];
      const scoreDescription = scoreSlot.querySelector("p");
      if (scoreDescription) {
        scoreDescription.textContent = `View or download the published score for ${scoreTitle}.`;
      }

      const scoreLink = document.createElement("a");
      scoreLink.className = "button button--primary score-slot__button";
      scoreLink.href = scoreSource;
      scoreLink.target = "_blank";
      scoreLink.rel = "noreferrer";
      scoreLink.textContent = "Open score PDF";
      scoreSlot.append(scoreLink);
    })
    .catch(() => {});
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const project = String(data.get("project") || "General inquiry");
    const message = String(data.get("message") || "").trim();
    const subject = `Portfolio inquiry from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${project}`,
      "",
      message,
    ].join("\n");

    if (formStatus) {
      formStatus.textContent = "Opening your email app with this message prepared…";
    }

    window.location.href = `mailto:Nikhil.murali103@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
