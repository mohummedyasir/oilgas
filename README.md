# Gulf Energy Jobs 🛢️⚡

**The Gulf region's dedicated job board for oil, gas, power and renewable-energy careers.**
Covering the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain — **powered by Business Umbrella.**

A fast, SEO-optimised, fully static job board. No database or server required to run — every
page is pre-rendered to plain HTML, which is ideal for search-engine indexing, speed and
launching on free static hosting.

---

## ✨ Features

- **Home page** with hero search, live stats, featured jobs, category & country browsing.
- **Jobs listing** (`/jobs.html`) with instant client-side search, filtering (country /
  category / contract type) and sorting.
- **Individual job pages** — one static, indexable page per vacancy.
- **About / Post a Job / Contact** pages with working demo forms.
- **Fully responsive** and mobile-first.

### 🔍 SEO built in
- Unique `<title>` + meta description, canonical URL, Open Graph & Twitter cards on every page.
- **`JobPosting` structured data (schema.org JSON-LD)** on every job — eligible for
  **Google Jobs** rich results.
- `BreadcrumbList`, `Organization` and `WebSite` (+ Sitelinks Search Box) structured data.
- Auto-generated **`sitemap.xml`**, **`robots.txt`** and PWA **`site.webmanifest`**.
- Semantic HTML, fast-loading, self-contained CSS/JS.

---

## 🚀 Quick start

```bash
# Build the static site (regenerates all HTML from the job data)
npm run build

# Preview locally at http://localhost:3000
npm start
```

Everything is generated into the repository root (`index.html`, `jobs.html`, `jobs/*.html`,
`sitemap.xml`, …) so you can open the files directly or serve the folder with any static host.

---

## 🌐 Deploy / Launch

The built HTML is committed at the repo root, so the fastest, most reliable launch
**needs no build server or Actions runner** — GitHub Pages serves the branch directly.

### Recommended: branch-based GitHub Pages (one setting, no runner)

1. Make sure the repo is **public** (Settings → General) — required for free Pages.
2. **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**
   → Branch: **`main`**, Folder: **`/ (root)`** → **Save**.
3. Wait ~1 minute. The site is live at **`https://<user>.github.io/<repo>/`**
   (for this repo: `https://mohummedyasir.github.io/oilgas/`).

A `.nojekyll` file is included so GitHub serves the static files as-is. To refresh
the site after editing jobs, run `npm run build` and commit the regenerated HTML.

### Alternative: GitHub Actions (only if hosted runners are available)

The included `.github/workflows/deploy.yml` (manual dispatch) builds and deploys via
Actions. Use it only if your account has hosted runners; otherwise prefer the
branch-based method above.

**Custom domain:** add a `CNAME` file containing your domain (e.g. `www.gulfenergyjobs.com`)
and configure DNS with your registrar, or set it under Settings → Pages.

The site is 100% static, so it also drops straight onto Netlify, Vercel, Cloudflare Pages,
S3 or any web host.

### After launch — get indexed fast
- Submit `sitemap.xml` in **Google Search Console** and **Bing Webmaster Tools**.
- Validate job pages with Google's **Rich Results Test** to confirm `JobPosting` eligibility.

---

## 🗂️ Adding or editing jobs

All content lives in **`src/data/jobs.json`**. Add an object to the `jobs` array and run
`npm run build` — a new SEO-ready page, sitemap entry and listing card are generated
automatically.

```jsonc
{
  "id": "gej-1019",                 // unique id → becomes /jobs/gej-1019.html
  "title": "Wellsite Geologist",
  "company": "Example Energy",
  "logo": "EE",                     // 2–3 letters shown in the badge
  "category": "Subsurface & Reservoir",
  "sector": "Oil & Gas",
  "employmentType": "FULL_TIME",    // FULL_TIME | CONTRACTOR | PART_TIME | TEMPORARY
  "location": "Abu Dhabi",
  "country": "United Arab Emirates",
  "countryCode": "AE",              // ISO-2, used for schema.org + flag
  "remote": false,
  "salaryMin": 25000,
  "salaryMax": 35000,
  "salaryCurrency": "AED",
  "salaryPeriod": "MONTH",          // MONTH | YEAR
  "experience": "5+ years",
  "datePosted": "2026-07-24",
  "validThrough": "2026-09-24",
  "featured": false,
  "summary": "Short one-line teaser for cards and meta descriptions.",
  "description": "Full role overview paragraph.",
  "responsibilities": ["…"],
  "requirements": ["…"],
  "benefits": ["…"]
}
```

> The sample vacancies and employer names included in this repo are **illustrative demo
> data** to showcase the platform. Replace them with your real, verified listings before
> going live.

---

## 🧱 Project structure

```
├── src/data/jobs.json        # ← single source of truth for all jobs
├── scripts/build.js          # static-site generator
├── assets/
│   ├── css/styles.css        # design system & styles
│   ├── js/main.js            # nav, hero search, forms
│   ├── js/jobs.js            # listing search/filter/sort
│   └── img/                  # logo, OG image, icons
├── .github/workflows/        # GitHub Pages deploy
└── (generated) index.html, jobs.html, jobs/*.html, sitemap.xml, robots.txt, …
```

Generated HTML is committed so the site works with zero build step on any static host; run
`npm run build` after changing data or templates.

---

## 🎨 Tech

Plain HTML + CSS + vanilla JavaScript, generated by a small Node script. No frameworks, no
runtime dependencies, no tracking — fast by default.

---

© Gulf Energy Jobs · Powered by **Business Umbrella**
