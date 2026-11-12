"use strict";

// A saved manual choice takes priority over the visitor's local clock.
const themeStorageKey = "youten-space-theme";
const themeToggle = document.querySelector(".theme-toggle");
let manualTheme = null;
let themeTimer;

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(themeStorageKey);
    return saved === "day" || saved === "night" ? saved : null;
  } catch {
    return null; // The clock still works when browser storage is unavailable.
  }
}

function updateTheme() {
  clearTimeout(themeTimer);
  const now = new Date();
  const isDaytime = now.getHours() >= 6 && now.getHours() < 18;
  const theme = manualTheme || (isDaytime ? "day" : "night");
  document.body.classList.toggle("theme-day", theme === "day");
  document.body.classList.toggle("theme-night", theme === "night");
  themeToggle.setAttribute("aria-pressed", String(theme === "night"));
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "day" ? "night" : "day"} theme`);
  themeToggle.querySelector(".theme-label").textContent = theme === "day" ? "Day" : "Night";

  // Recheck at the next local 06:00 or 18:00 boundary while in automatic mode.
  if (!manualTheme) {
    const nextChange = new Date(now);
    if (now.getHours() < 6) nextChange.setHours(6, 0, 0, 0);
    else if (now.getHours() < 18) nextChange.setHours(18, 0, 0, 0);
    else {
      nextChange.setDate(nextChange.getDate() + 1);
      nextChange.setHours(6, 0, 0, 0);
    }
    themeTimer = setTimeout(updateTheme, nextChange.getTime() - now.getTime());
  }
}

manualTheme = readSavedTheme();
updateTheme();
themeToggle.hidden = false;
themeToggle.addEventListener("click", () => {
  manualTheme = document.body.classList.contains("theme-day") ? "night" : "day";
  try {
    localStorage.setItem(themeStorageKey, manualTheme);
  } catch {
    // Keep the manual choice for this page even when storage is blocked.
  }
  updateTheme();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateTheme();
});
window.addEventListener("pageshow", updateTheme);
window.addEventListener("storage", (event) => {
  if (event.key === themeStorageKey || event.key === null) {
    manualTheme = readSavedTheme();
    updateTheme();
  }
});

// Edit the three main button URLs and the email link here.
// Use complete https:// URLs, or mailto: for an email address.
const links = {
  youtube: "https://www.youtube.com/@youten",
  tiktok: "https://www.tiktok.com/@youtenx",
  donate: "https://ezdn.app/youtenx",
  email: "mailto:youten.space@gmail.com",
};

document.querySelectorAll("[data-link]").forEach((anchor) => {
  const destination = links[anchor.dataset.link];
  if (!destination) return;

  anchor.href = destination;

  // Web links open separately; email links open the visitor's mail app.
  if (destination.startsWith("mailto:")) {
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  } else {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
});
