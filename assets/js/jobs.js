/* Gulf Energy Jobs — job listing filtering & search
   Reads window.GEJ_JOBS (injected by jobs-data.js) */
(function () {
  "use strict";
  var JOBS = window.GEJ_JOBS || [];
  var listEl = document.getElementById("job-list");
  if (!listEl) return;

  var countEl = document.getElementById("result-count");
  var searchEl = document.getElementById("filter-search");
  var sortEl = document.getElementById("sort-select");
  var clearBtn = document.getElementById("clear-filters");

  var state = { q: "", countries: [], categories: [], types: [], sort: "recent" };

  // Hydrate from URL params (from homepage search)
  var params = new URLSearchParams(window.location.search);
  if (params.get("q")) state.q = params.get("q");
  if (params.get("country")) state.countries = [params.get("country")];
  if (params.get("category")) state.categories = [params.get("category")];

  function money(n, cur) { return cur + " " + n.toLocaleString("en-US"); }

  function salaryText(j) {
    var per = j.salaryPeriod === "MONTH" ? "/mo" : (j.salaryPeriod === "YEAR" ? "/yr" : "");
    return money(j.salaryMin, j.salaryCurrency) + " – " + money(j.salaryMax, j.salaryCurrency) +
      " <small>" + per + "</small>";
  }

  function typeLabel(t) {
    return ({ FULL_TIME: "Full-time", CONTRACTOR: "Contract", PART_TIME: "Part-time", TEMPORARY: "Temporary" })[t] || t;
  }

  function slug(id) { return "jobs/" + id + ".html"; }

  function cardHTML(j) {
    var tags = '<span class="tag sector">' + j.sector + '</span>' +
      '<span class="tag type">' + typeLabel(j.employmentType) + '</span>' +
      (j.remote ? '<span class="tag remote">Remote friendly</span>' : '');
    return '' +
      '<article class="job-card">' +
        (j.featured ? '<span class="featured-flag">Featured</span>' : '') +
        '<div class="top">' +
          '<div class="logo-badge">' + j.logo + '</div>' +
          '<div><h3><a href="' + slug(j.id) + '">' + j.title + '</a></h3>' +
          '<div class="company">' + j.company + '</div></div>' +
        '</div>' +
        '<div class="job-meta">' +
          '<span>📍 ' + j.location + ', ' + j.country + '</span>' +
          '<span>💼 ' + j.experience + '</span>' +
        '</div>' +
        '<p class="summary">' + j.summary + '</p>' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="foot">' +
          '<span class="salary">' + salaryText(j) + '</span>' +
          '<a class="btn btn-teal btn-sm" href="' + slug(j.id) + '">View job</a>' +
        '</div>' +
      '</article>';
  }

  function apply() {
    var q = state.q.toLowerCase();
    var filtered = JOBS.filter(function (j) {
      if (q) {
        var hay = (j.title + " " + j.company + " " + j.category + " " + j.sector + " " + j.location + " " + j.country + " " + j.summary).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      if (state.countries.length && state.countries.indexOf(j.country) === -1) return false;
      if (state.categories.length && state.categories.indexOf(j.category) === -1) return false;
      if (state.types.length && state.types.indexOf(j.employmentType) === -1) return false;
      return true;
    });

    filtered.sort(function (a, b) {
      if (state.sort === "salary") return b.salaryMax - a.salaryMax;
      if (state.sort === "az") return a.title.localeCompare(b.title);
      // recent (default): featured first, then date
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.datePosted) - new Date(a.datePosted);
    });

    countEl.innerHTML = "<strong>" + filtered.length + "</strong> job" + (filtered.length === 1 ? "" : "s") + " found";
    if (!filtered.length) {
      listEl.innerHTML = '<div class="no-results"><h3>No jobs match your filters</h3><p>Try broadening your search or clearing filters.</p></div>';
    } else {
      listEl.innerHTML = filtered.map(cardHTML).join("");
    }
  }

  // Wire up checkbox filters
  document.querySelectorAll("[data-filter]").forEach(function (cb) {
    var group = cb.getAttribute("data-filter");
    var val = cb.value;
    // pre-check based on URL state
    if (group === "country" && state.countries.indexOf(val) !== -1) cb.checked = true;
    if (group === "category" && state.categories.indexOf(val) !== -1) cb.checked = true;
    cb.addEventListener("change", function () {
      var arr = group === "country" ? state.countries : group === "category" ? state.categories : state.types;
      var idx = arr.indexOf(val);
      if (cb.checked && idx === -1) arr.push(val);
      if (!cb.checked && idx !== -1) arr.splice(idx, 1);
      apply();
    });
  });

  if (searchEl) {
    searchEl.value = state.q;
    searchEl.addEventListener("input", function () { state.q = searchEl.value; apply(); });
  }
  if (sortEl) sortEl.addEventListener("change", function () { state.sort = sortEl.value; apply(); });
  if (clearBtn) clearBtn.addEventListener("click", function () {
    state = { q: "", countries: [], categories: [], types: [], sort: "recent" };
    document.querySelectorAll("[data-filter]").forEach(function (cb) { cb.checked = false; });
    if (searchEl) searchEl.value = "";
    if (sortEl) sortEl.value = "recent";
    apply();
  });

  apply();
})();
