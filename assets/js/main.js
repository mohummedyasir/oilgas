/* Gulf Energy Jobs — shared UI behaviour */
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  // Homepage hero search -> redirect to jobs listing with query params
  var heroForm = document.querySelector("[data-hero-search]");
  if (heroForm) {
    heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      var kw = heroForm.querySelector("[name=keyword]");
      var loc = heroForm.querySelector("[name=location]");
      if (kw && kw.value.trim()) params.set("q", kw.value.trim());
      if (loc && loc.value) params.set("country", loc.value);
      var base = heroForm.getAttribute("data-base") || "jobs.html";
      window.location.href = base + (params.toString() ? "?" + params.toString() : "");
    });
  }

  // Simple contact / post-a-job form handling (front-end only demo)
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.querySelector(".form-success");
      if (success) {
        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  });

  // Copy-link share button
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        var original = btn.getAttribute("title");
        btn.setAttribute("title", "Link copied!");
        setTimeout(function () { btn.setAttribute("title", original); }, 1600);
      }
    });
  });
})();
