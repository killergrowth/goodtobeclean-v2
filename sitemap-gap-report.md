# G2BC Sitemap Gap Report
**Generated:** 2026-08-24  
**Live:** https://goodtobeclean.com/sitemap.xml  
**Staging:** https://staging.goodtobeclean-v2.pages.dev/sitemap.xml

---

## Raw Counts

| Source | Total URLs |
|--------|-----------|
| Live sitemap | 610 |
| Live after filtering WP junk | 522 |
| Staging sitemap | 442 |
| **Missing from staging** | **99** |

---

## WP Junk Filtered from Live (88 URLs — do not replicate in v2)

These were stripped before comparison and should NOT be built in v2:

- **Author archive pages** (7): `/author/cleaning_d0620e/`, `/author/fiverr/`, `/author/netclix-jordan/`, `/author/noel-killergrowth/`, `/author/phil-killergrowth/`, `/author/samuel/`, `/author/seo-killergrowth/`
- **Author pagination** (3): `/author/seo-killergrowth/page/2/` through `/page/4/`
- **Blog pagination** (11): `/blog/page/2/` through `/blog/page/12/`
- **Home pagination** (5): `/page/2/` through `/page/6/`
- **Category archives** (10): `/category/air-duct-cleaning/`, `/category/blog/`, `/category/carpet-cleaning/`, `/category/dryer-vent/`, `/category/home-restoration/`, `/category/hvac/`, `/category/smoke-damage-repair/`, `/category/upholstery-cleaning/` + 2 paginated
- **Tag archives** (49): All `/tag/*/` pages
- **ct-mega-menu** (2): `/ct-mega-menu/`, `/ct-mega-menu/areas-served/`
- **Header/footer templates via Elementor/HFE category** (not applicable — handled under live URLs below)

---

## Missing from Staging — Grouped by Category

### 1. Service Hub Pages (8 missing)

Top-level service pages exist on live but are **not in the staging sitemap**. Some may exist as pages but are not being indexed, or are genuinely missing.

| URL | Notes |
|-----|-------|
| `/air-duct-cleaning/` | Core service page |
| `/carpet-cleaning/` | Core service page |
| `/fire-smoke-restoration/` | Core service page |
| `/mold-remediation/` | Core service page |
| `/water-damage-restoration/` | Core service page |
| `/restoration-services/` | Appears to be a blog/landing page on live |
| `/soda-blasting/` | Specialty service page |
| `/vapor-barrier/` | Specialty service page |

> **Note:** Staging has `/services/` prefixed versions (`/services/air-duct-cleaning/`, etc.) that don't exist on live. The live site uses top-level slugs (e.g. `/carpet-cleaning/`). These are URL structure mismatches — staging's `/services/xxx` pages may cover the same content but under a different path.

---

### 2. Service + City Pages (17 missing)

All 17 are **water-damage-restoration** city variants. Every other service (carpet cleaning, air duct, fire/smoke) has full city coverage. Water damage is missing the following cities (staging has no `/water-damage-restoration/[city]/` pages at all — only the non-`-ks`-suffixed variants were checked):

| Missing URL |
|-------------|
| `/water-damage-restoration/eastborough/` |
| `/water-damage-restoration/el-dorado/` |
| `/water-damage-restoration/eureka/` |
| `/water-damage-restoration/goddard/` |
| `/water-damage-restoration/haysville/` |
| `/water-damage-restoration/leon/` |
| `/water-damage-restoration/maize/` |
| `/water-damage-restoration/newton/` |
| `/water-damage-restoration/park-city/` |
| `/water-damage-restoration/potwin/` |
| `/water-damage-restoration/rosalia/` |
| `/water-damage-restoration/rose-hill/` |
| `/water-damage-restoration/sedgwick/` |
| `/water-damage-restoration/valley-center/` |
| `/water-damage-restoration/wellington-ks/` |
| `/water-damage-restoration/whitewater/` |
| `/water-damage-restoration/wichita/` |

> **Note:** Live uses non-`-ks`-suffixed slugs for water damage cities (e.g. `/water-damage-restoration/wichita/`), while fire/smoke restoration on staging has both suffixed and non-suffixed variants. Wellington is listed with `-ks` suffix on live (unique among water damage cities).

---

### 3. Areas-Served City Pages (0 missing)

✅ All 26 `/areas-served/[city]-ks/` pages are present on staging. No gaps here.

---

### 4. Blog Posts (57 missing)

None of the live blog posts are in the staging sitemap. This is expected — blog migration has not happened yet (pending Claudia sign-off per project brief).

Full list of missing blog post URLs:

| URL |
|-----|
| `/affordable-carpet-cleaning-for-busy-homes/` |
| `/affordable-home-restoration-el-dorado-help/` |
| `/air-duct-cleaning-a-key-step-for-healthy-living/` |
| `/air-duct-cleaning-that-boosts-home-efficiency/` |
| `/best-carpet-cleaning-in-el-dorado-fast-reliable/` |
| `/boost-hvac-efficiency-with-air-duct-cleaning/` |
| `/carpet-cleaning-101-how-often-should-you-really-clean-your-carpets/` |
| `/carpet-cleaning-before-after-andover-ks-good-to-be-clean/` |
| `/carpet-cleaning-for-allergies-why-el-dorado-ks-families-should-act-now/` |
| `/carpet-cleaning-frequency-guide-el-dorado-ks-good-to-be-clean/` |
| `/carpet-cleaning-in-el-dorado-your-1-choice/` |
| `/carpet-cleaning-tips-to-keep-your-floors-fresh-and-spotless/` |
| `/cleaning-game/` |
| `/diy-carpet-cleaning-vs-hiring-professionals-whats-best-for-el-dorado-ks-homes/` |
| `/dryer-vent-cleaning-services-el-dorado-ks-good-to-be-clean/` |
| `/emergency-carpet-cleaning-services/` |
| `/expert-carpet-stain-removal-guide-for-homeowners-in-el-dorado-ks/` |
| `/expert-home-restoration-el-dorado-solutions/` |
| `/fast-reliable-carpet-cleaning-in-el-dorado/` |
| `/fire-and-smoke-damage-how-to-restore-your-home-after-a-fire/` |
| `/home-restoration-el-dorado-services-guide/` |
| `/home-restoration-guide-for-water-fire-and-mold-damage/` |
| `/home-restoration-services-for-local-property-owners/` |
| `/home-restoration-services-signs-your-property-needs-help/` |
| `/home-restoration-solutions-to-restore-comfort-and-safety/` |
| `/home-restoration-tips-to-protect-and-increase-property-value/` |
| `/how-air-duct-cleaning-improves-your-homes/` |
| `/how-carpet-cleaning-improves-air-quality-fast/` |
| `/how-expert-restoration-services-handle-mold-removal/` |
| `/how-restoration-services-save-homes-after-water-damage/` |
| `/how-smoke-damage-repair-protects-indoor-air-quality/` |
| `/how-smoke-damage-repair-restores-your-home/` |
| `/how-to-choose-the-best-air-duct-cleaning/` |
| `/local-home-restoration-solutions-for-property-damage/` |
| `/mold-myths-debunked-what-every-homeowner-needs-to-know/` |
| `/pet-odor-stain-removal-carpet-cleaning-el-dorado-ks-good-to-be-clean/` |
| `/professional-air-duct-cleaning-services-for-cleaner-air/` |
| `/professional-carpet-cleaning-services-for-a-healthier-home/` |
| `/professional-home-restoration-for-residential-properties/` |
| `/refresh-your-floors-with-el-dorado-carpet-cleaning/` |
| `/restore-your-home-faster-with-smoke-damage-repair-experts/` |
| `/safe-and-professional-mold-removal-services/` |
| `/seasonal-carpet-care-summer-cleaning-in-el-dorado-ks-good-to-be-clean/` |
| `/the-benefits-of-a-house-cleaning-subscription-why-its-worth-it/` |
| `/the-hidden-dangers-of-dirty-air-ducts-and-why-you-should-clean-them/` |
| `/top-5-signs-your-air-ducts-need-cleaning-el-dorado-ks-good-to-be-clean/` |
| `/top-benefits-of-hiring-professional-restoration-services/` |
| `/trusted-carpet-cleaning-el-dorado-experts-near-you/` |
| `/trusted-home-restoration-el-dorado-experts/` |
| `/trusted-home-restoration-for-homes-and-businesses-nearby/` |
| `/upholstery-cleaning-guide-el-dorado-ks-good-to-be-clean/` |
| `/water-damage-restoration-what-to-do-in-the-first-24-hours/` |
| `/what-to-expect-during-a-smoke-damage-repair-process/` |
| `/what-to-expect-from-water-damage-restoration/` |
| `/why-air-duct-cleaning-matters-for-allergy-and-dust-control/` |
| `/why-professional-restoration-services-matter-after-fires/` |
| `/why-smoke-damage-repair-is-vital-after-a-house-fire/` |

> **Status:** Blog migration is intentionally deferred — must message Claudia before migrating. These are expected gaps.

---

### 5. WP Header/Footer Template Pages (9 — do not replicate)

These are WordPress Elementor/header-footer-elementor template pages that leaked into the live sitemap. They should **not** be built in v2.

| URL |
|-----|
| `/header/` |
| `/header/main-header-1/` |
| `/header/main-header-2/` |
| `/header/main-header-3/` |
| `/header/sticky-header-1/` |
| `/header/sticky-header-2/` |
| `/header/sticky-header-3/` |
| `/footer/` |
| `/footer/footer-default/` |

---

### 6. /service/ Alias Pages (7 — needs decision)

Live has a `/service/` prefix URL for each service (separate from the top-level service pages). These may be WP custom post type pages or duplicates. Staging has `/services/` (plural) instead.

| Live URL | Staging Equivalent |
|----------|-------------------|
| `/service/air-duct-cleaning/` | `/services/air-duct-cleaning/` |
| `/service/carpet-cleaning/` | `/services/carpet-cleaning/` |
| `/service/fire-and-smoke-restoration/` | `/services/fire-smoke-restoration/` |
| `/service/mold-removal/` | `/services/mold-remediation/` |
| `/service/soda-blasting/` | `/services/soda-blasting/` |
| `/service/vapor-barrier-installation/` | `/services/vapor-barrier/` |
| `/service/water-damage-restoration/` | `/services/water-damage-restoration/` |

> **Decision needed:** Are the live `/service/` pages indexable content that needs 301 redirects to the v2 `/services/` equivalents? Or are they WP CPT artifacts that can be dropped? Check if they have meaningful content and/or inbound links before deciding.

---

### 7. /sitemap/ Page (1 — low priority)

`/sitemap/` is a WP HTML sitemap page on live. Not present in staging. Low priority — can add a static HTML sitemap page later if needed.

---

## Staging-Only URLs (Present in v2 but NOT on live — 8 URLs)

These are new pages introduced in v2 that don't exist on the current live site:

| Staging URL | Notes |
|-------------|-------|
| `/services/air-duct-cleaning/` | New `/services/` hub — replaces `/service/` and `/air-duct-cleaning/` |
| `/services/carpet-cleaning/` | Same |
| `/services/fire-smoke-restoration/` | Same |
| `/services/mold-remediation/` | Same |
| `/services/restoration-services/` | New |
| `/services/soda-blasting/` | Same |
| `/services/vapor-barrier/` | Same |
| `/services/water-damage-restoration/` | Same |

> **Note:** Blog pagination pages `/blog/page/2/` through `/blog/page/12/` are in the staging sitemap but not in the (filtered) live sitemap — these are expected once blog content is migrated.

---

## Summary Table

| Category | Count | Action Required? |
|----------|-------|-----------------|
| Service hub pages missing | 8 | ✅ Yes — confirm `/services/` vs top-level routing, ensure redirects |
| Service+city pages (WDR only) | 17 | ✅ Yes — build `/water-damage-restoration/[city]/` pages |
| Areas-served city pages | 0 | ✅ None — fully covered |
| Blog posts | 57 | ⏳ Deferred — awaiting Claudia sign-off |
| WP header/footer templates | 9 | ❌ Do not replicate |
| /service/ alias pages | 7 | ⚠️ Needs decision on redirects |
| /sitemap/ page | 1 | Low priority |
| **TOTAL ACTIONABLE GAPS** | **25** | (8 service hubs + 17 WDR city pages) |

---

## Key Findings

1. **Water damage restoration city pages are completely missing from staging.** All 17 city variants under `/water-damage-restoration/` are absent. Every other service has full city coverage (carpet: 26 cities ✅, air duct: 26 cities ✅, fire/smoke: present ✅). This is the biggest structural gap.

2. **Service hub pages have a URL structure mismatch.** Live uses top-level slugs (`/carpet-cleaning/`, `/air-duct-cleaning/`, etc.). Staging uses `/services/` prefix (`/services/carpet-cleaning/`). The hub pages themselves are missing from staging's top-level paths — 301 redirects from old → new paths will be needed at cutover.

3. **Blog migration is 0% complete** — all 57 blog posts are absent. This is intentional and expected per project brief (Claudia sign-off required).

4. **Areas-served section is fully built** — 26 city pages all present on staging. ✅

5. **WP junk is clean** — 88 WordPress artifact URLs correctly excluded from v2.
