// Cache the controls once so each interaction updates the existing page elements.
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primaryNav");
const themeToggle = document.querySelector("#themeToggle");
const currentYear = document.querySelector("#currentYear");

// Keep the copyright year current instead of leaving a date that will go stale.
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

// Start with the saved choice, or follow the device preference until the visitor chooses.
if (themeToggle) {
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const initialTheme =
    document.documentElement.dataset.theme ||
    (systemPrefersDark ? "dark" : "light");

  function updateTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${isDark ? "light" : "dark"} theme`,
    );
    themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  }

  updateTheme(initialTheme);

  // Apply each selection immediately and remember it for the next visit.
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    updateTheme(nextTheme);

    try {
      window.localStorage.setItem("adegoke-portfolio-theme", nextTheme);
    } catch (error) {
      console.error("Unable to save the selected color theme.", error);
    }
  });
}

if (menuToggle && primaryNav) {
  // Use one close helper so every way of dismissing the mobile menu stays in sync.
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  };

  // Toggle the menu and its ARIA state together for assistive technologies.
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  // Close the menu after a visitor chooses a destination within the page.
  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  // Escape and outside clicks let keyboard and pointer users dismiss the menu.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      event.target instanceof Node &&
      !primaryNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });
}
