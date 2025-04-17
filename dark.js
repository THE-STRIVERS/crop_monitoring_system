// theme-toggle.js
document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Check localStorage for theme preference
    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode");
        if (themeToggle) themeToggle.textContent = "☀️";
    }

    // Toggle Dark Mode
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");

            if (body.classList.contains("dark-mode")) {
                localStorage.setItem("dark-mode", "enabled");
                themeToggle.textContent = "☀️"; // Change icon to Sun
            } else {
                localStorage.setItem("dark-mode", "disabled");
                themeToggle.textContent = "🌙"; // Change icon to Moon
            }
        });
    }
});
