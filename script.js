const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const year = document.querySelector("[data-year]");
const navLabel = navToggle?.querySelector(".sr-only");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const backgroundContent = document.querySelectorAll("main, .site-footer");
const sectionLinks = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])];
const trackedSections = sectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter(({ section }) => section && section.id !== "top");

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateScrollState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
  scrollProgress?.style.setProperty("--scroll-progress", progress.toFixed(4));

  const marker =
    window.scrollY + (header?.offsetHeight ?? 0) + Math.min(window.innerHeight * 0.28, 240);
  let activeSection = null;

  trackedSections.forEach(({ section }) => {
    if (section.offsetTop <= marker) activeSection = section.id;
  });

  trackedSections.forEach(({ link, section }) => {
    const active = section.id === activeSection;
    link.classList.toggle("is-active", active);

    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

let scrollFrame = null;

const requestScrollUpdate = () => {
  if (scrollFrame !== null) return;

  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollState();
    scrollFrame = null;
  });
};

const setNavigation = (open) => {
  nav?.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  backgroundContent.forEach((element) => element.toggleAttribute("inert", open));

  if (navLabel) {
    navLabel.textContent = open ? "Close navigation" : "Open navigation";
  }

  if (open) {
    nav?.querySelector("a")?.focus();
  }
};

updateScrollState();
window.addEventListener("scroll", requestScrollUpdate, { passive: true });

navToggle?.addEventListener("click", () => {
  setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNavigation(false));
});

document.addEventListener("keydown", (event) => {
  const navigationOpen = navToggle?.getAttribute("aria-expanded") === "true";

  if (!navigationOpen) return;

  if (event.key === "Escape") {
    setNavigation(false);
    navToggle?.focus();
    return;
  }

  if (event.key === "Tab" && navToggle && nav) {
    const focusableItems = [navToggle, ...nav.querySelectorAll("a")].filter(
      (element) => !element.hasAttribute("disabled")
    );
    const firstItem = focusableItems[0];
    const lastItem = focusableItems.at(-1);

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem?.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem?.focus();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setNavigation(false);
  requestScrollUpdate();
});

const initializeReveals = () => {
  const revealTargets = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  try {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    revealTargets.forEach((target) => observer.observe(target));
    document.documentElement.classList.add("js");
  } catch {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }
};

initializeReveals();
