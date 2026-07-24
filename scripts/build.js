#!/usr/bin/env node
/* ==========================================================================
   Gulf Energy Jobs — static site generator
   Reads src/data/jobs.json and emits SEO-optimised static HTML.
   Usage: node scripts/build.js   (optional: SITE_URL=https://example.com)
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/jobs.json"), "utf8"));
const JOBS = DATA.jobs;

const SITE_URL = (process.env.SITE_URL || "https://www.gulfenergyjobs.com").replace(/\/$/, "");
const SITE_NAME = "Gulf Energy Jobs";
const TAGLINE = "Oil, Gas & Energy Jobs in the Gulf";
const TODAY = new Date().toISOString().slice(0, 10);

/* ----------------------------- helpers ----------------------------------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html.trim() + "\n");
  console.log("  ✓ " + rel);
}
function money(n, cur) { return cur + " " + Number(n).toLocaleString("en-US"); }
function typeLabel(t) {
  return ({ FULL_TIME: "Full-time", CONTRACTOR: "Contract", PART_TIME: "Part-time", TEMPORARY: "Temporary" })[t] || t;
}
const FLAGS = { AE: "🇦🇪", SA: "🇸🇦", QA: "🇶🇦", KW: "🇰🇼", OM: "🇴🇲", BH: "🇧🇭" };

const COUNTRIES = [...new Set(JOBS.map(j => j.country))];
const CATEGORIES = [...new Set(JOBS.map(j => j.category))].sort();
const TYPES = [...new Set(JOBS.map(j => j.employmentType))];

function catCount(c) { return JOBS.filter(j => j.category === c).length; }
function countryCount(c) { return JOBS.filter(j => j.country === c).length; }

/* Category icon (inline SVG paths) */
function catIcon() {
  return '<svg class="icon-svg" viewBox="0 0 24 24" width="22" height="22"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>';
}

/* ----------------------------- partials ---------------------------------- */
function head(opts) {
  const {
    title, description, canonical, ogType = "website", jsonld = "", extraCss = ""
  } = opts;
  const ogImage = SITE_URL + "/assets/img/og-image.png";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Business Umbrella">
<meta name="theme-color" content="#071a2f">
<!-- Open Graph -->
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="en_GB">
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="/assets/img/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">
${extraCss}
${jsonld}
</head>
<body>`;
}

function header(active) {
  const on = (p) => (active === p ? ' class="active"' : "");
  return `
<header class="site-header">
  <div class="container">
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="/index.html" aria-label="Gulf Energy Jobs home">
        <img class="mark" src="/assets/img/logo.svg" alt="Gulf Energy Jobs logo" width="34" height="34">
        <span>Gulf Energy Jobs<small>Powered by Business Umbrella</small></span>
      </a>
      <ul class="nav-links">
        <li><a href="/jobs.html"${on("jobs")}>Browse Jobs</a></li>
        <li><a href="/index.html#categories">Categories</a></li>
        <li><a href="/index.html#countries">Locations</a></li>
        <li><a href="/about.html"${on("about")}>About</a></li>
        <li><a href="/contact.html"${on("contact")}>Contact</a></li>
      </ul>
      <div class="nav-cta">
        <a class="btn btn-outline btn-sm" href="/jobs.html">Find a job</a>
        <a class="btn btn-primary btn-sm" href="/post-job.html">Post a Job</a>
      </div>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </nav>
  </div>
</header>`;
}

function footer() {
  const catLinks = CATEGORIES.slice(0, 6).map(c =>
    `<li><a href="/jobs.html?category=${encodeURIComponent(c)}">${esc(c)}</a></li>`).join("");
  const countryLinks = COUNTRIES.map(c =>
    `<li><a href="/jobs.html?country=${encodeURIComponent(c)}">${esc(c)}</a></li>`).join("");
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/index.html">
          <img class="mark" src="/assets/img/logo.svg" alt="" width="34" height="34">
          <span>Gulf Energy Jobs<small>Powered by Business Umbrella</small></span>
        </a>
        <p>The Gulf's dedicated job board for oil, gas, renewable and energy professionals — connecting talent with leading employers across the GCC.</p>
      </div>
      <div>
        <h4>Popular Categories</h4>
        <ul>${catLinks}</ul>
      </div>
      <div>
        <h4>Locations</h4>
        <ul>${countryLinks}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/post-job.html">Post a Job</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/jobs.html">All Jobs</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Gulf Energy Jobs. All rights reserved.</span>
      <span class="powered">Powered by <strong>Business Umbrella</strong></span>
    </div>
  </div>
</footer>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

/* ----------------------------- job card ---------------------------------- */
function salaryText(j) {
  const per = j.salaryPeriod === "MONTH" ? "/mo" : (j.salaryPeriod === "YEAR" ? "/yr" : "");
  return money(j.salaryMin, j.salaryCurrency) + " – " + money(j.salaryMax, j.salaryCurrency) + ` <small>${per}</small>`;
}
function jobCard(j) {
  const tags = `<span class="tag sector">${esc(j.sector)}</span>` +
    `<span class="tag type">${typeLabel(j.employmentType)}</span>` +
    (j.remote ? `<span class="tag remote">Remote friendly</span>` : "");
  return `
    <article class="job-card">
      ${j.featured ? '<span class="featured-flag">Featured</span>' : ""}
      <div class="top">
        <div class="logo-badge">${esc(j.logo)}</div>
        <div>
          <h3><a href="/jobs/${j.id}.html">${esc(j.title)}</a></h3>
          <div class="company">${esc(j.company)}</div>
        </div>
      </div>
      <div class="job-meta">
        <span>📍 ${esc(j.location)}, ${esc(j.country)}</span>
        <span>💼 ${esc(j.experience)}</span>
      </div>
      <p class="summary">${esc(j.summary)}</p>
      <div class="tags">${tags}</div>
      <div class="foot">
        <span class="salary">${salaryText(j)}</span>
        <a class="btn btn-teal btn-sm" href="/jobs/${j.id}.html">View job</a>
      </div>
    </article>`;
}

/* =========================================================================
   PAGE: Home
   ========================================================================= */
function buildHome() {
  const featured = JOBS.filter(j => j.featured).slice(0, 6);
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL + "/",
    "description": `The leading job board for oil, gas, renewable and energy careers across the Gulf region.`,
    "publisher": { "@type": "Organization", "name": "Business Umbrella" },
    "potentialAction": {
      "@type": "SearchAction",
      "target": SITE_URL + "/jobs.html?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  })}</script>
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL + "/",
    "logo": SITE_URL + "/assets/img/logo.svg",
    "parentOrganization": { "@type": "Organization", "name": "Business Umbrella" },
    "areaServed": ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain"]
  })}</script>`;

  const countryOptions = COUNTRIES.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  const catCards = CATEGORIES.map(c => `
      <a class="cat-card" href="/jobs.html?category=${encodeURIComponent(c)}">
        <div class="ci">${catIcon()}</div>
        <div><div class="cn">${esc(c)}</div><div class="cc">${catCount(c)} open role${catCount(c) === 1 ? "" : "s"}</div></div>
      </a>`).join("");
  const countryCards = COUNTRIES.map(c => `
      <a class="country-card" href="/jobs.html?country=${encodeURIComponent(c)}">
        <div class="flag">${FLAGS[JOBS.find(j => j.country === c).countryCode] || "🌐"}</div>
        <div class="cn">${esc(c)}</div>
        <div class="cc">${countryCount(c)} job${countryCount(c) === 1 ? "" : "s"}</div>
      </a>`).join("");
  const companies = [...new Set(JOBS.map(j => j.company))].slice(0, 6)
    .map(c => `<span class="co">${esc(c)}</span>`).join("");

  const html = head({
    title: `${SITE_NAME} | Oil, Gas & Energy Jobs in the Gulf (UAE, Saudi, Qatar & GCC)`,
    description: `Find the latest oil, gas, renewable and energy jobs across the Gulf — UAE, Saudi Arabia, Qatar, Kuwait, Oman & Bahrain. ${JOBS.length}+ live vacancies from leading employers. Powered by Business Umbrella.`,
    canonical: SITE_URL + "/",
    jsonld
  }) + header("home") + `
<main>
  <section class="hero">
    <div class="container hero-inner">
      <span class="hero-badge"><span class="dot"></span> ${JOBS.length}+ live energy vacancies across the GCC</span>
      <h1>The Gulf's home for <span class="accent">oil, gas &amp; energy</span> careers</h1>
      <p class="lede">Browse hand-picked roles from leading operators, EPC contractors and renewable-energy pioneers across the United Arab Emirates, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain.</p>
      <form class="search-card" data-hero-search data-base="/jobs.html" role="search" aria-label="Job search">
        <label class="field">
          <span class="icon" aria-hidden="true">🔍</span>
          <input type="text" name="keyword" placeholder="Job title, skill or company" aria-label="Keyword">
        </label>
        <label class="field">
          <span class="icon" aria-hidden="true">📍</span>
          <select name="location" aria-label="Country">
            <option value="">All Gulf countries</option>
            ${countryOptions}
          </select>
        </label>
        <button class="btn btn-primary" type="submit">Search jobs</button>
      </form>
      <div class="hero-stats">
        <div class="stat"><div class="num">${JOBS.length}+</div><div class="lbl">Live Jobs</div></div>
        <div class="stat"><div class="num">6</div><div class="lbl">GCC Countries</div></div>
        <div class="stat"><div class="num">${CATEGORIES.length}</div><div class="lbl">Disciplines</div></div>
        <div class="stat"><div class="num">${[...new Set(JOBS.map(j => j.company))].length}+</div><div class="lbl">Employers</div></div>
      </div>
    </div>
  </section>

  <div class="trust">
    <div class="container trust-inner">
      <span class="lbl">Trusted by leading Gulf energy employers</span>
      ${companies}
    </div>
  </div>

  <section class="section" id="featured">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Handpicked</div>
        <h2>Featured energy jobs</h2>
        <p>Premium opportunities from top employers across the oil, gas and clean-energy sectors.</p>
      </div>
      <div class="job-grid">${featured.map(jobCard).join("")}</div>
      <div class="text-center mt-2"><a class="btn btn-teal" href="/jobs.html">View all ${JOBS.length} jobs →</a></div>
    </div>
  </section>

  <section class="section" id="categories" style="background:#fff;border-top:1px solid var(--slate-100);border-bottom:1px solid var(--slate-100);">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Explore by discipline</div>
        <h2>Browse jobs by category</h2>
        <p>From drilling and subsurface to renewables and digital — find your specialism.</p>
      </div>
      <div class="cat-grid">${catCards}</div>
    </div>
  </section>

  <section class="section" id="countries">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Across the Gulf</div>
        <h2>Energy jobs by location</h2>
        <p>Opportunities in every corner of the GCC energy market.</p>
      </div>
      <div class="country-grid">${countryCards}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="features">
        <div class="feature"><div class="fi"><svg class="icon-svg" viewBox="0 0 24 24" width="26" height="26"><path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/></svg></div><h3>Specialist focus</h3><p>Only energy roles — no noise. Every vacancy is oil, gas, power or renewables.</p></div>
        <div class="feature"><div class="fi"><svg class="icon-svg" viewBox="0 0 24 24" width="26" height="26"><path d="M20 6 9 17l-5-5"/></svg></div><h3>Verified employers</h3><p>Roles sourced from established operators, EPCs and clean-energy developers.</p></div>
        <div class="feature"><div class="fi"><svg class="icon-svg" viewBox="0 0 24 24" width="26" height="26"><path d="M12 2v20M2 12h20"/></svg></div><h3>Whole-Gulf coverage</h3><p>UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain in one place.</p></div>
        <div class="feature"><div class="fi"><svg class="icon-svg" viewBox="0 0 24 24" width="26" height="26"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg></div><h3>Apply in minutes</h3><p>Clean, mobile-first listings with clear salary and requirements.</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="band">
        <h2>Hiring energy talent in the Gulf?</h2>
        <p>Reach thousands of qualified oil, gas and energy professionals across the GCC. Post your vacancy today — powered by Business Umbrella's recruitment expertise.</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="/post-job.html">Post a Job</a>
          <a class="btn btn-ghost" href="/contact.html">Talk to our team</a>
        </div>
      </div>
    </div>
  </section>
</main>` + footer();

  write("index.html", html);
}

/* =========================================================================
   PAGE: Jobs listing
   ========================================================================= */
function buildJobsList() {
  const countryChecks = COUNTRIES.map(c =>
    `<label class="check"><input type="checkbox" data-filter="country" value="${esc(c)}"> ${esc(c)} <span style="color:var(--slate-400);margin-left:auto">${countryCount(c)}</span></label>`).join("");
  const catChecks = CATEGORIES.map(c =>
    `<label class="check"><input type="checkbox" data-filter="category" value="${esc(c)}"> ${esc(c)} <span style="color:var(--slate-400);margin-left:auto">${catCount(c)}</span></label>`).join("");
  const typeChecks = TYPES.map(t =>
    `<label class="check"><input type="checkbox" data-filter="type" value="${esc(t)}"> ${typeLabel(t)}</label>`).join("");

  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" },
      { "@type": "ListItem", "position": 2, "name": "Jobs", "item": SITE_URL + "/jobs.html" }
    ]
  })}</script>`;

  const html = head({
    title: `Browse ${JOBS.length}+ Oil, Gas & Energy Jobs in the Gulf | ${SITE_NAME}`,
    description: `Search and filter ${JOBS.length}+ live oil, gas, power and renewable-energy jobs across the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain. Updated daily. Powered by Business Umbrella.`,
    canonical: SITE_URL + "/jobs.html",
    jsonld
  }) + header("jobs") + `
<main>
  <section class="page-head">
    <div class="container">
      <div class="breadcrumbs"><a href="/index.html">Home</a> / Jobs</div>
      <h1>Oil, Gas &amp; Energy Jobs in the Gulf</h1>
      <p>Browse ${JOBS.length} live vacancies across the GCC — filter by country, discipline and contract type.</p>
    </div>
  </section>
  <div class="container">
    <div class="listing">
      <aside class="filters" aria-label="Filter jobs">
        <input id="filter-search" class="filter-search" type="text" placeholder="Search jobs…" aria-label="Search jobs">
        <div class="filter-group">
          <h3>Country</h3>
          ${countryChecks}
        </div>
        <div class="filter-group">
          <h3>Category</h3>
          ${catChecks}
        </div>
        <div class="filter-group">
          <h3>Contract Type</h3>
          ${typeChecks}
        </div>
        <button id="clear-filters" class="clear-filters" type="button">Clear all filters</button>
      </aside>
      <div>
        <div class="results-bar">
          <span class="count" id="result-count"></span>
          <select class="sort-select" id="sort-select" aria-label="Sort jobs">
            <option value="recent">Most recent</option>
            <option value="salary">Highest salary</option>
            <option value="az">A–Z</option>
          </select>
        </div>
        <div class="job-list" id="job-list"></div>
      </div>
    </div>
  </div>
</main>
<script src="/assets/js/jobs-data.js"></script>
<script src="/assets/js/jobs.js" defer></script>` + footer();

  write("jobs.html", html);
}

/* =========================================================================
   PAGE: individual job detail (one per job) + JobPosting JSON-LD
   ========================================================================= */
function buildJobDetail(j) {
  const descHtml =
    `<p>${esc(j.description)}</p>` +
    `<h3>Key responsibilities</h3><ul>${j.responsibilities.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` +
    `<h3>What you'll bring</h3><ul>${j.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` +
    `<h3>What's on offer</h3><ul>${j.benefits.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`;

  const jobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": j.title,
    "description": descHtml,
    "identifier": { "@type": "PropertyValue", "name": j.company, "value": j.id },
    "datePosted": j.datePosted,
    "validThrough": j.validThrough + "T23:59",
    "employmentType": j.employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": j.company,
      "sameAs": SITE_URL + "/"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": j.location,
        "addressCountry": j.countryCode
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": j.salaryCurrency,
      "value": {
        "@type": "QuantitativeValue",
        "minValue": j.salaryMin,
        "maxValue": j.salaryMax,
        "unitText": j.salaryPeriod
      }
    },
    "industry": j.sector,
    "occupationalCategory": j.category,
    "directApply": true
  };
  if (j.remote) {
    jobPosting.jobLocationType = "TELECOMMUTE";
    jobPosting.applicantLocationRequirements = { "@type": "Country", "name": j.country };
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" },
      { "@type": "ListItem", "position": 2, "name": "Jobs", "item": SITE_URL + "/jobs.html" },
      { "@type": "ListItem", "position": 3, "name": j.title, "item": SITE_URL + "/jobs/" + j.id + ".html" }
    ]
  };

  const jsonld = `<script type="application/ld+json">${JSON.stringify(jobPosting)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

  const related = JOBS.filter(x => x.id !== j.id && (x.category === j.category || x.country === j.country)).slice(0, 3);

  const html = head({
    title: `${j.title} at ${j.company} — ${j.location}, ${j.country} | ${SITE_NAME}`,
    description: `${j.summary} ${typeLabel(j.employmentType)} role in ${j.location}, ${j.country}. ${money(j.salaryMin, j.salaryCurrency)}–${money(j.salaryMax, j.salaryCurrency)}. Apply now on Gulf Energy Jobs.`,
    canonical: SITE_URL + "/jobs/" + j.id + ".html",
    ogType: "article",
    jsonld
  }) + header("jobs") + `
<main>
  <section class="page-head">
    <div class="container">
      <div class="breadcrumbs"><a href="/index.html">Home</a> / <a href="/jobs.html">Jobs</a> / ${esc(j.title)}</div>
    </div>
  </section>
  <div class="container">
    <div class="detail-wrap">
      <article class="detail-main">
        <div class="detail-header">
          <div class="logo-badge">${esc(j.logo)}</div>
          <div>
            <h1>${esc(j.title)}</h1>
            <div class="company">${esc(j.company)}</div>
            <div class="job-meta" style="margin-top:.6rem">
              <span>📍 ${esc(j.location)}, ${esc(j.country)}</span>
              <span>💼 ${typeLabel(j.employmentType)}</span>
              <span>⏳ ${esc(j.experience)}</span>
              ${j.remote ? "<span>🌐 Remote friendly</span>" : ""}
            </div>
            <div class="tags" style="margin-top:.8rem">
              <span class="tag sector">${esc(j.sector)}</span>
              <span class="tag">${esc(j.category)}</span>
              ${j.featured ? '<span class="tag" style="background:rgba(245,165,36,.15);color:#a5670a">Featured</span>' : ""}
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h2>About the role</h2>
          <p>${esc(j.description)}</p>
        </div>
        <div class="detail-section">
          <h2>Key responsibilities</h2>
          <ul>${j.responsibilities.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
        </div>
        <div class="detail-section">
          <h2>What you'll bring</h2>
          <ul>${j.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
        </div>
        <div class="detail-section">
          <h2>What's on offer</h2>
          <ul>${j.benefits.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
        </div>
        <a class="btn btn-primary" href="/contact.html?job=${encodeURIComponent(j.id)}">Apply for this role</a>
      </article>

      <aside class="aside-card">
        <div class="apply-salary">${money(j.salaryMin, j.salaryCurrency)} – ${money(j.salaryMax, j.salaryCurrency)}</div>
        <div class="apply-salary"><small>${j.salaryPeriod === "MONTH" ? "per month (tax-free)" : "per year"}</small></div>
        <a class="btn btn-primary btn-block" style="margin-top:1rem" href="/contact.html?job=${encodeURIComponent(j.id)}">Apply now</a>
        <ul class="fact-list">
          <li><span class="k">Location</span><span class="v">${esc(j.location)}, ${esc(j.country)}</span></li>
          <li><span class="k">Sector</span><span class="v">${esc(j.sector)}</span></li>
          <li><span class="k">Category</span><span class="v">${esc(j.category)}</span></li>
          <li><span class="k">Contract</span><span class="v">${typeLabel(j.employmentType)}</span></li>
          <li><span class="k">Experience</span><span class="v">${esc(j.experience)}</span></li>
          <li><span class="k">Posted</span><span class="v">${esc(j.datePosted)}</span></li>
        </ul>
        <div class="share-row">
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL + "/jobs/" + j.id + ".html")}" target="_blank" rel="noopener" title="Share on LinkedIn" aria-label="Share on LinkedIn">in</a>
          <a href="https://wa.me/?text=${encodeURIComponent(j.title + " — " + SITE_URL + "/jobs/" + j.id + ".html")}" target="_blank" rel="noopener" title="Share on WhatsApp" aria-label="Share on WhatsApp">✆</a>
          <a href="#" data-copy-link title="Copy link" aria-label="Copy link">🔗</a>
        </div>
      </aside>
    </div>

    ${related.length ? `
    <section class="section" style="padding-top:1rem">
      <h2 style="margin-bottom:1.4rem">Similar jobs</h2>
      <div class="job-grid">${related.map(jobCard).join("")}</div>
    </section>` : ""}
  </div>
</main>` + footer();

  write("jobs/" + j.id + ".html", html);
}

/* =========================================================================
   PAGE: About
   ========================================================================= */
function buildAbout() {
  const html = head({
    title: `About Gulf Energy Jobs | Energy Recruitment, Powered by Business Umbrella`,
    description: `Gulf Energy Jobs is the GCC's specialist job board for oil, gas, power and renewable-energy careers — powered by Business Umbrella's recruitment expertise.`,
    canonical: SITE_URL + "/about.html"
  }) + header("about") + `
<main>
  <section class="page-head">
    <div class="container">
      <div class="breadcrumbs"><a href="/index.html">Home</a> / About</div>
      <h1>About Gulf Energy Jobs</h1>
      <p>The Gulf's dedicated marketplace for energy talent.</p>
    </div>
  </section>
  <div class="container section">
    <div class="prose">
      <p>Gulf Energy Jobs is a specialist job board built exclusively for the oil, gas, power and renewable-energy sectors across the Gulf Cooperation Council — the United Arab Emirates, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain.</p>
      <p>We connect skilled engineers, technicians, project managers and commercial professionals with the operators, EPC contractors and clean-energy developers driving the region's energy economy. Whether you are an experienced drilling engineer chasing your next offshore rotation, a reservoir specialist, or a project developer shaping the Gulf's hydrogen and solar future — this is your home.</p>

      <h2>Why we exist</h2>
      <p>The Gulf sits at the heart of the global energy industry, yet talent and opportunity are often scattered across generic job boards. We bring them together in one focused, high-signal place — no noise, only energy roles.</p>

      <div class="value-grid">
        <div class="value"><div class="vi">⚡</div><h3>Sector specialists</h3><p>100% focused on oil, gas, power and renewables — nothing else.</p></div>
        <div class="value"><div class="vi">🌍</div><h3>Whole-Gulf reach</h3><p>Every GCC market, from Abu Dhabi to Dhahran to Ras Laffan.</p></div>
        <div class="value"><div class="vi">🤝</div><h3>Trusted employers</h3><p>Roles from established operators and reputable contractors.</p></div>
        <div class="value"><div class="vi">🚀</div><h3>Fast & modern</h3><p>Clean, mobile-first listings that let you apply in minutes.</p></div>
      </div>

      <h2>Powered by Business Umbrella</h2>
      <p>Gulf Energy Jobs is powered by <strong>Business Umbrella</strong> — a recruitment and business-services group with deep expertise across the Middle East. That heritage means employers gain access to a genuine talent network, and candidates find roles backed by real recruitment support.</p>

      <div class="band" style="margin-top:2.5rem">
        <h2>Ready to make your next move?</h2>
        <p>Browse live energy vacancies across the Gulf, or post a role to reach qualified professionals today.</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="/jobs.html">Browse Jobs</a>
          <a class="btn btn-ghost" href="/post-job.html">Post a Job</a>
        </div>
      </div>
    </div>
  </div>
</main>` + footer();
  write("about.html", html);
}

/* =========================================================================
   PAGE: Post a Job
   ========================================================================= */
function buildPostJob() {
  const countryOpts = COUNTRIES.map(c => `<option>${esc(c)}</option>`).join("");
  const catOpts = CATEGORIES.map(c => `<option>${esc(c)}</option>`).join("");
  const html = head({
    title: `Post a Job — Hire Energy Talent in the Gulf | ${SITE_NAME}`,
    description: `Advertise your oil, gas, power or renewable-energy vacancy to thousands of qualified GCC professionals. Post a job on Gulf Energy Jobs, powered by Business Umbrella.`,
    canonical: SITE_URL + "/post-job.html"
  }) + header("post") + `
<main>
  <section class="page-head">
    <div class="container">
      <div class="breadcrumbs"><a href="/index.html">Home</a> / Post a Job</div>
      <h1>Post a Job</h1>
      <p>Reach thousands of qualified energy professionals across the Gulf.</p>
    </div>
  </section>
  <div class="container section">
    <div class="prose">
      <div class="card">
        <h2 style="margin-top:0">Tell us about your vacancy</h2>
        <p class="form-note">Complete the form and our team at Business Umbrella will be in touch to publish your role. Fields marked * are required.</p>
        <form data-demo-form>
          <div class="form-grid">
            <div class="form-field"><label>Company name *</label><input type="text" required></div>
            <div class="form-field"><label>Contact email *</label><input type="email" required></div>
            <div class="form-field full"><label>Job title *</label><input type="text" required placeholder="e.g. Senior Drilling Engineer"></div>
            <div class="form-field"><label>Country *</label><select required><option value="">Select…</option>${countryOpts}</select></div>
            <div class="form-field"><label>City / Location</label><input type="text" placeholder="e.g. Abu Dhabi"></div>
            <div class="form-field"><label>Category</label><select>${catOpts}</select></div>
            <div class="form-field"><label>Contract type</label><select><option>Full-time</option><option>Contract</option><option>Part-time</option><option>Temporary</option></select></div>
            <div class="form-field full"><label>Job description *</label><textarea rows="6" required placeholder="Responsibilities, requirements and benefits…"></textarea></div>
          </div>
          <div style="margin-top:1.3rem"><button class="btn btn-primary" type="submit">Submit vacancy</button></div>
          <div class="form-success">✓ Thank you! Your vacancy has been received. A member of the Business Umbrella team will contact you shortly to confirm publication.</div>
        </form>
      </div>
    </div>
  </div>
</main>` + footer();
  write("post-job.html", html);
}

/* =========================================================================
   PAGE: Contact
   ========================================================================= */
function buildContact() {
  const html = head({
    title: `Contact Us | ${SITE_NAME}`,
    description: `Get in touch with the Gulf Energy Jobs team, powered by Business Umbrella. Questions about jobs, applications or advertising a vacancy across the GCC.`,
    canonical: SITE_URL + "/contact.html"
  }) + header("contact") + `
<main>
  <section class="page-head">
    <div class="container">
      <div class="breadcrumbs"><a href="/index.html">Home</a> / Contact</div>
      <h1>Contact Us</h1>
      <p>We'd love to hear from you.</p>
    </div>
  </section>
  <div class="container section">
    <div class="prose">
      <div class="card">
        <h2 style="margin-top:0">Send us a message</h2>
        <form data-demo-form>
          <div class="form-grid">
            <div class="form-field"><label>Full name *</label><input type="text" required></div>
            <div class="form-field"><label>Email *</label><input type="email" required></div>
            <div class="form-field full"><label>Subject</label><input type="text" placeholder="How can we help?"></div>
            <div class="form-field full"><label>Message *</label><textarea rows="6" required></textarea></div>
          </div>
          <div style="margin-top:1.3rem"><button class="btn btn-primary" type="submit">Send message</button></div>
          <div class="form-success">✓ Thanks for reaching out! We'll get back to you within one business day.</div>
        </form>
      </div>
      <div class="value-grid" style="margin-top:2rem">
        <div class="value"><div class="vi">✉️</div><h3>Email</h3><p>careers@gulfenergyjobs.com</p></div>
        <div class="value"><div class="vi">🏢</div><h3>Powered by</h3><p>Business Umbrella — recruitment &amp; business services</p></div>
        <div class="value"><div class="vi">🌍</div><h3>Coverage</h3><p>UAE · Saudi Arabia · Qatar · Kuwait · Oman · Bahrain</p></div>
      </div>
    </div>
  </div>
</main>` + footer();
  write("contact.html", html);
}

/* =========================================================================
   PAGE: 404
   ========================================================================= */
function build404() {
  const html = head({
    title: `Page not found | ${SITE_NAME}`,
    description: `The page you're looking for could not be found.`,
    canonical: SITE_URL + "/404.html"
  }) + header("") + `
<main>
  <div class="container section text-center">
    <h1 style="font-size:5rem;margin-bottom:0">404</h1>
    <p style="font-size:1.2rem;color:var(--slate-500)">We couldn't find that page — but there are plenty of energy jobs waiting.</p>
    <a class="btn btn-primary" href="/jobs.html">Browse jobs</a>
  </div>
</main>` + footer();
  write("404.html", html);
}

/* =========================================================================
   Data file for client-side filtering
   ========================================================================= */
function buildJobsData() {
  const light = JOBS.map(j => ({
    id: j.id, title: j.title, company: j.company, logo: j.logo, category: j.category,
    sector: j.sector, employmentType: j.employmentType, location: j.location, country: j.country,
    countryCode: j.countryCode, remote: j.remote, salaryMin: j.salaryMin, salaryMax: j.salaryMax,
    salaryCurrency: j.salaryCurrency, salaryPeriod: j.salaryPeriod, experience: j.experience,
    datePosted: j.datePosted, featured: j.featured, summary: j.summary
  }));
  write("assets/js/jobs-data.js", "window.GEJ_JOBS = " + JSON.stringify(light) + ";");
}

/* =========================================================================
   sitemap.xml, robots.txt, manifest
   ========================================================================= */
function buildSitemap() {
  const urls = [
    { loc: "/", pri: "1.0", freq: "daily" },
    { loc: "/jobs.html", pri: "0.9", freq: "daily" },
    { loc: "/about.html", pri: "0.5", freq: "monthly" },
    { loc: "/post-job.html", pri: "0.6", freq: "monthly" },
    { loc: "/contact.html", pri: "0.4", freq: "monthly" },
    ...JOBS.map(j => ({ loc: "/jobs/" + j.id + ".html", pri: "0.8", freq: "weekly", lastmod: j.datePosted }))
  ];
  const body = urls.map(u =>
    `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${u.lastmod || TODAY}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`);
}

function buildRobots() {
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml`);
}

function buildManifest() {
  write("site.webmanifest", JSON.stringify({
    name: SITE_NAME,
    short_name: "Energy Jobs",
    description: "Oil, gas & energy jobs across the Gulf. Powered by Business Umbrella.",
    start_url: "/index.html",
    display: "standalone",
    background_color: "#071a2f",
    theme_color: "#071a2f",
    icons: [
      { src: "/assets/img/logo.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/assets/img/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/img/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  }, null, 2));
}

/* ----------------------------- run --------------------------------------- */
console.log("Building Gulf Energy Jobs (" + JOBS.length + " jobs) → " + SITE_URL);
buildHome();
buildJobsList();
JOBS.forEach(buildJobDetail);
buildAbout();
buildPostJob();
buildContact();
build404();
buildJobsData();
buildSitemap();
buildRobots();
buildManifest();
console.log("Done. Generated " + (JOBS.length + 9) + " HTML pages + data/sitemap/robots.");
