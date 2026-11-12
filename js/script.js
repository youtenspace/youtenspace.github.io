"use strict";

// Every load follows local time until the visitor previews the other theme.
const themeToggle = document.querySelector(".theme-toggle");
let manualTheme = null;
let themeTimer;

function updateTheme() {
  clearTimeout(themeTimer);
  const now = new Date();
  const isDaytime = now.getHours() >= 6 && now.getHours() < 18;
  const theme = manualTheme || (isDaytime ? "day" : "night");
  document.body.classList.toggle("theme-day", theme === "day");
  document.body.classList.toggle("theme-night", theme === "night");
  const nextTheme = theme === "day" ? "night" : "day";
  themeToggle.setAttribute("aria-label", `Theme: ${theme}. Preview ${nextTheme} theme`);
  themeToggle.setAttribute("aria-pressed", String(theme === "night"));
  themeToggle.title = `Preview ${nextTheme} until refresh`;
  themeToggle.querySelector(".theme-label").textContent = theme === "day" ? "Day" : "Night";

  // Recheck at the next local 06:00 or 18:00 boundary while in automatic mode.
  if (manualTheme === null) {
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

updateTheme();
themeToggle.hidden = false;
themeToggle.addEventListener("click", () => {
  manualTheme = document.body.classList.contains("theme-day") ? "night" : "day";
  updateTheme();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateTheme();
});
window.addEventListener("pageshow", updateTheme);

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
