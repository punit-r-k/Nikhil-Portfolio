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
