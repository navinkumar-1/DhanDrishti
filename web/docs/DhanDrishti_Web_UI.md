# DhanDrishti: Web Dashboard UI Specification (Stockate-style layout + Screen-by-Screen Copy)

> **Companion to:** `DhanDrishti_App_Architecture.md` and `DhanDrishti_App_UI.md` (mobile spec)
> **Visual reference:** the Stockate dashboard screenshot (left sidebar, top bar, white cards on a light grey page, one strong blue, pill chips, dark chart tooltip). Same colours, same card style, same typography, same component shapes, same layout. Only text, data and a few controls change so the UI obeys the architecture rules (read-only, no advice, no invented numbers).
> **Purpose:** hand this file to Cursor / Windsurf / Copilot together with the architecture file. It gives exact tokens, the app shell, components and the on-screen text for every screen ID (S01 to S49) in the desktop/web layout.

---

## 0. How to use this file

1. Build tokens (Section 2) into `lib/app/theme/`: `color_tokens.dart`, `text_styles.dart`, `spacing.dart`, `status_colors.dart`.
2. Build the **app shell** (Section 3) once: sidebar, top bar, page header, content grid.
3. Build shared components (Section 4) into `lib/shared/widgets/`.
4. Build screens from Section 5 (three hero screens, matched to the reference) and Section 6 (all other screens, same visual language, rendered inside the same shell).
5. All text is the **English default**. Put it in `app_en.arb` (key pattern `feature_screen_element`). Hindi key labels are in Section 8 (unreviewed).
6. Amounts use Indian format (₹8,40,000). Never floating point. Sample numbers come from Architecture Section 18 and must match the engine's expected-results file. Numbers marked *(derived)* are calculated from those and must be re-checked.

### 0.1 Adaptations from the reference image (required by the architecture rules)

| Reference (Stockate) shows | DhanDrishti shows | Why |
|---|---|---|
| Brand "Stockate" + logo | **DhanDrishti** + `primary` logo tile with eye-on-rupee glyph | Own brand |
| Sidebar: Dashboard, Portfolio, My Stock, Deposit, Insight, Market Stock, Market Bitcoin, News Update, Help Center, Settings | Dashboard, Holdings, Accounts, Import data, Insights · Concentration, Hidden Connections, Follow my money, Risk insights · Learn, What-if lab, Ask · Settings, About | Architecture Section 7.1 |
| "Export Report" button | **Export Report** (kept, read-only PDF/CSV of the on-screen data) | Export is read-only |
| Search "Search now..." | "Search holdings or ISIN" | S14 |
| Share icon, bell (red dot), user block | Export icon, bell = Issues (S17, red dot when open issues), user block "Demo Investor / demo@dhandrishti.example", plus EN / हिं toggle | Language requirement |
| Portfolio Value with "Your profit is $81,234,72 ↑ 8.2 %" | **Total valued holdings** with "Imported accounts, as of 29 Sep 2026" + TrustChip | No gain/loss drama, no profit claims |
| Avg. Monthly Grow / Best Profit Stock | **Valued holdings** "12 of 14" / **Largest holding** "Meridian Bank" | No performance claims |
| Line chart of portfolio value (Jun to Jan) | **Snapshot timeline** (stepped line of valued holdings at each real import date) | No forecasts, no invented curve |
| Watchlist (Add New) | **Largest holdings** (See all) | Rule 12: no recommendations or watchlist tips |
| Green ↑ / red ↓ % chips | **Share-of-total** chips (neutral blue-grey) and **StatusBadges** (Matched green, Needs review orange-red) | Colour never signals gain or loss |
| Tabs: Stock Sector, Stock Index, Stock Calendar, Stock Analyst | **By asset class · By company · By sector · By account** | S21 lenses |
| Four sector cards (Energy, Finance, Health, Raw Product) | Four **asset-class cards** (Equity, ETF, Mutual fund, Bond) | Same card shape |
| My Stock table (Invest Date, Volume, Change, Price/stock, Number of lots) | **My holdings** table (Account, Units, Status, Value, Share, As of) | No order or trade fields |
| Brand logos (Adidas, Apple, BMW, Nike) | Initial avatars, synthetic names | Rule 19 |
| `$` | `₹` with lakh/crore grouping | Rule 25 |
| Sidebar promo "Get $120 USD / Invite Friend" | **Hidden Connections** promo card "Reveal" | Signature feature |
| Any buy / sell / invest control | none | Rule 11: read-only |

---

## 1. Visual direction (from the reference)

Clean, white, finance-grade desktop dashboard. Light grey page, white bordered cards with 14 px radius, big bold numbers, one strong blue for every primary action and active state, pill chips, circular-outlined icon buttons in the top bar, a dark rounded chart tooltip, and a blue promo card pinned at the bottom of the sidebar. Nothing flashy.

---

## 2. Design tokens

### 2.1 Colour (light theme, sampled from the reference)

| Token | Hex | Used for (as seen in reference) |
|---|---|---|
| `primary` | `#1A6DFF` | Export Report button, active sidebar item + left bar, active tab, chart line and area, selected-point dot, active x-label, links ("Sep"/"Jan, 24"), promo card bg, "See more" style actions |
| `primaryPressed` | `#1252D6` | Pressed state |
| `primaryTint` | `#EAF1FF` | Active tab background, TrustChip bg, selected rows |
| `onPrimary` | `#FFFFFF` | Text/icon on primary |
| `canvas` | `#F7F8FA` | Page background behind cards |
| `surface` | `#FFFFFF` | Cards, sidebar, top bar, table |
| `surfaceMuted` | `#F6F7F9` | Table header row, input fields, evidence tables |
| `border` | `#E8EBF0` | 1 px card outline, dividers, sidebar edge, chart grid |
| `textPrimary` | `#111827` | Headlines, big numbers, names |
| `textSecondary` | `#6B7280` | Sub-labels, subtitles, table headers, "Add New"-style links |
| `textTertiary` | `#9CA3AF` | Placeholders, chart axis, inactive icons |
| `tooltipBg` | `#1F2933` | Dark chart tooltip (white value, grey sub-line) |
| `positive` / `positiveBg` | `#12B76A` / `#E7F8EF` | Matched status and Fresh only (never for gains) |
| `danger` / `dangerBg` | `#D9480F` / `#FFE9DD` | Needs review, Stale (orange-red, not alarming red) |
| `warning` / `warningBg` | `#B7791F` / `#FFF4D6` | Pending settlement, Aging, partial-data banners |

### 2.2 Status tokens (`status_colors.dart`). Never colour alone: icon + label always

| Status | Foreground | Background | Icon |
|---|---|---|---|
| Matched | `#0E9F6E` | `#E3F6EE` | check_circle |
| Single source | `#5B6B82` | `#EEF1F5` | radio_button_checked |
| Pending settlement | `#B7791F` | `#FFF4D6` | schedule |
| Needs review | `#D9480F` | `#FFE9DD` | error_outline |
| Fresh / Aging / Stale | `#0E9F6E` / `#B7791F` / `#D9480F` | same tints | dot |
| Illustrative | `#6D4AFF` | `#EFEAFF` | auto_awesome |
| Confirmed (S25) | `#FFFFFF` | `#0E9F6E` solid | check |
| Connected (S25) | `#5B6B82` | `#EEF1F5` + dashed border | link |

### 2.3 Asset-class palette (same in every chart, chip and card icon)

| Class | Hex |
|---|---|
| Equity | `#F2683C` (card icon) / chart `#1A6DFF` |
| ETF | `#00A3C4` |
| Mutual fund | `#7C5CFA` |
| REIT | `#F59E0B` |
| InvIT | `#12B76A` |
| Bond | `#EF6C8A` |
| Unknown / Unclassified | `#9CA3AF` |

The four asset-class cards use solid coloured circular icon tiles (40 px, white glyph), like the orange / blue / cyan / purple icons in the reference.

### 2.4 Dark theme

| Token | Hex |
|---|---|
| canvas | `#0B0F17` |
| surface | `#151B26` |
| surfaceMuted | `#1C2431` |
| border | `#263042` |
| textPrimary | `#F3F5F8` |
| textSecondary | `#9AA4B5` |
| primary | `#4C82FF` |
| primaryTint | `#16264D` |

Status backgrounds use the foreground at 18 % opacity on dark.

### 2.5 Typography (Inter + Noto Sans Devanagari, bundled)

| Style | Size / line | Weight | Used for |
|---|---|---|---|
| `pageTitle` | 28 / 34 | 700 | "Dashboard" |
| `display` | 34 / 40 | 700 | Total valued holdings |
| `priceLarge` | 26 / 32 | 700 | Card values (asset-class cards, holding detail) |
| `titleCard` | 18 / 26 | 600 | "Largest holdings", "My holdings" |
| `bodyStrong` | 15 / 22 | 600 | Names, row values |
| `body` | 14 / 20 | 400 | Normal text, sidebar items (500 when active) |
| `label` | 13 / 18 | 400 | Sub-labels, subtitles, table headers |
| `caption` | 12 / 16 | 400 | Chips, ISIN, footers |
| `axis` | 12 / 16 | 400 | Chart axis |
| `button` | 15 / 22 | 600 | Buttons |

Devanagari: same sizes, line-height × 1.35, never truncate to one line where meaning is lost.

### 2.6 Spacing, radius, elevation (`spacing.dart`)

| Token | Value |
|---|---|
| Grid | 4 px |
| Sidebar width | 236 (collapsed 72) |
| Top bar height | 64, white, 1 px bottom `border` |
| Page padding | 24 |
| Card padding | 20 |
| Gap between cards | 16 |
| Section gap | 24 |
| Card radius | 14, 1 px `border`, flat (no shadow) |
| Button height / radius | 44 / 10 |
| Search field | 280 × 40, radius 20 (pill), `surfaceMuted` |
| Circular icon button | 40, 1 px `border`, white fill |
| Pill (chips, badges) radius | 999 |
| Tooltip | `tooltipBg`, radius 8, small arrow, padding 8 × 12 |
| Breakpoints | ≥ 1200 full shell · 768 to 1199 collapsed sidebar + 2-col grid · < 768 sidebar becomes 5-tab bottom nav (Home, Holdings, Insights, Learn, Ask), single column |

---

## 3. App shell (every signed-in screen)

```
┌──────────┬──────────────────────────────────────────────────────┐
│ Sidebar  │ Top bar: [Search] ............ [Export][Bell][EN|हिं][User ▾] │
│ 236 px   ├──────────────────────────────────────────────────────┤
│          │ Page title + subtitle ................ [Primary button]│
│          │ Content grid (12 col, gap 16)                        │
│ Promo    │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

### 3.1 Sidebar
- Top: logo tile 28 (`primary`, radius 8) + **DhanDrishti** 22 bold.
- Item: icon 20 + `body` label, height 40, gap 4. Inactive: `textSecondary`. **Active: `primary` text + icon, 3 px `primary` bar on the left edge**, no fill.
- Groups separated by a 1 px `border` line (as in the reference):
  1. **Dashboard · Holdings · Accounts · Import data · Insights**
  2. **Concentration · Hidden Connections · Follow my money · Risk insights · Cash-flow calendar** (last hidden unless flag on)
  3. **Learn · What-if lab · Ask**
  4. **Settings · About and disclaimers**
- Bottom: **Promo card** (`primary` bg, radius 14, padding 16, subtle inner border). White circular icon tile, title **"Hidden Connections"** 16 bold white, subtitle "See which holdings depend on one company" 12 white 85 %, full-width white button **"Reveal"** (primary text) → S23.
- Sample mode: small `Illustrative`-token chip "Sample data" above the promo card.

### 3.2 Top bar
Left: search field "Search holdings or ISIN". Right: circular **Export** icon (same slot as share), circular **Bell** with `#D9480F` dot when open issues exist (→ S17), **LanguageToggle** pill "EN | हिं", divider, **user block**: 40 px avatar, **Demo Investor** `bodyStrong`, "demo@dhandrishti.example" `caption` grey, chevron (menu: Settings, Privacy and data, About).

### 3.3 Page header
Left: `pageTitle` + grey `label` subtitle. Right: one primary button (44 px, `primary`, white text, leading icon), e.g. **Export Report**.

### 3.4 Shell-less screens
S01 to S05 use a centred 480 px white card on `canvas`, no sidebar, no top bar.

---

## 4. Shared components (`shared/widgets`)

| Component | Spec |
|---|---|
| **Card** | White, 1 px `border`, radius 14, padding 20 |
| **StatCard (top row)** | Card with grey `label` on top, big bold value, grey sub-line. Vertical 1 px divider between stats inside one card (as the Avg. Monthly / Best Profit block) |
| **MoneyText** | Indian grouping, ₹ prefix, optional compact (₹8.4 L, ₹1.2 Cr). Shows `••••••` when privacy mode is on |
| **PrivacyToggleEye** | Eye / eye-off 22 px `textSecondary`, right after the big number (as in reference) |
| **TrustChip** | Pill, height 26, `primaryTint` bg, `primary` text 12, dot coloured by freshness, text "Broker A · 29 Sep 2026". Opens SourceInfoSheet |
| **ShareChip** | Pill, `surfaceMuted` bg, `textSecondary` text 12, e.g. "16.7 % of total". Same shape as the green ↑ % chip, but neutral |
| **StatusBadge** | Pill, status tokens, icon 14 + label 12 semibold |
| **AssetClassChip** | Pill, 10 % tint of class colour, class colour text |
| **Tab strip** | Text tabs, 40 px high, gap 8. Active: `primary` text, `primaryTint` bg, radius 8 8 0 0, 2 px `primary` underline. Inactive `textSecondary`. 1 px `border` line under the whole strip |
| **AssetClassCard** | Card 240 × 124. Top: 40 px coloured circle icon + name `titleCard`; "⋯" right. Middle: grey `label` "N holdings" + info icon. Bottom: `priceLarge` value + ShareChip |
| **HoldingRow (list)** | 40 px circular initial avatar (`surfaceMuted`), name `bodyStrong`, grey `label` sub-line (class · account); right: value `bodyStrong` + ShareChip or StatusBadge; row height 64 |
| **DataTable** | Card; header row `surfaceMuted`, `label` semibold grey with sort icon; rows 64 px, 1 px divider; Export and Filter outlined buttons (36 px, radius 10, icon + text) top right |
| **ChartCard (line)** | Line `primary` 2 px, stepped in observation mode. Area gradient `primary` 12 % → 0. 5 horizontal 1 px `border` grid lines, y labels left `axis` grey. Active x label `primary`. Selected point: 10 px `primary` dot, dashed vertical `primary` guide, **dark tooltip** above (value 14 bold white + "Value · date" 11 grey) |
| **Dropdown pill** | White, 1 px `border`, radius 10, height 36, text 13 + chevron ("All sources ▾") |
| **Primary button** | 44 px, radius 10, `primary`, white text, optional leading icon |
| **Secondary button** | White, 1 px `border` (or `primary` when emphasised), dark or `primary` text |
| **InputCard (read-only / editable)** | `surfaceMuted`, radius 12, padding 16; grey label above, 26 bold number; trailing pill dropdown or Stepper; read-only has lock icon, no caret |
| **Stepper** | "−" 28 px outlined square, "+" 28 px `primary` square, radius 8 |
| **EvidenceTable** | `surfaceMuted`, radius 12, padding 14; header `caption` semibold uppercase; rows 28 px; footer total `bodyStrong` |
| **CoverageBanner** | Row card radius 12, info icon `primary`, text `label`, chevron. Partial/stale: bg `#FFF4D6`, icon `#B7791F` |
| **IllustrativeBadge** | Pill, Illustrative tokens, "Illustrative", opens assumptions |
| **AssumptionsPanel** | Expandable card: "Assumptions and what is excluded", bullets, "Edit" link `primary`; always "Excluded: fees, taxes, other cash flows" |
| **DisclaimerFooter** | Centred `caption` `textTertiary`, info icon: "Educational, not investment advice" (opens S48) |
| **ValueDeltaRow** | Two StatCards side by side: "Original" / "Under these assumptions", difference `caption` |
| **PromoCard** | As in sidebar promo (3.1); also reusable as full-width banner with right-aligned white button |
| **Skeleton / Empty / Error / Stale** | Skeleton = `surfaceMuted` blocks shimmering in final layout. Empty = 64 px outlined icon, `bodyStrong` message, `label` helper, primary button. Error = plain message + "Try again" (+ "Use last known data"). Stale = amber CoverageBanner |

---

## 5. Hero screens (matched to the reference)

### 5.1 S13 Home dashboard (reference: the whole screenshot)

Active sidebar item **Dashboard**.

1. **Page header:** `pageTitle` **Dashboard**, subtitle "Overview of your imported holdings". Right: primary button **Export Report** (upload icon).
2. **CoverageBanner** (full width): "3 accounts included · 1 flagged as missing: Groww account not connected" → S12.
3. **Main row (12-col grid: 8 + 4):**
   - **Left, Portfolio card (chart card):**
     - Top-left block: label "Total valued holdings" → `display` **₹8,40,000** + PrivacyToggleEye → under it grey `label` "Imported accounts, as of 29 Sep 2026" + TrustChip "3 sources · 29 Sep 2026".
     - Top-middle block: label "Valued holdings" → **12 of 14** → grey "2 not valued (no reliable price)", where "2 not valued" is `primary` and tappable. *(replaces Avg. Monthly Grow)*
     - Top-right block (after vertical divider): label "Largest holding" → avatar "M" + **Meridian Bank** `bodyStrong` + grey "Equity · 16.7 % of total". *(replaces Best Profit Stock)*
     - **Snapshot timeline chart** below: y axis in ₹ lakh ("₹0", "₹2 L", "₹4 L", "₹6 L", "₹8 L", "₹10 L"), x axis = real import dates, latest one `primary`. Tooltip on the selected point: **₹8,40,000** / "Value · 29 Sep 2026". If fewer than two snapshots exist: EmptyState "Only one import so far. The timeline grows as you add snapshots."
   - **Right, "Largest holdings" card** (same spot as Watchlist). Header: `titleCard` "Largest holdings", right grey link "See all" (→ S14). Five HoldingRows:
     1. Meridian Bank · Equity · Demat A · **₹1,40,000** · "16.7 % of total"
     2. Coastal Bank · Equity · Demat A · **₹1,12,800** · StatusBadge **Needs review**
     3. Broad Market ETF · ETF · Demat A · **₹1,00,000** · "11.9 % of total"
     4. Aster Industries · Equity · Demat A + B · **₹60,000** · "7.1 % of total" *(derived)*
     5. Aster 8.5 % bond · Bond · Demat A · **₹50,000** · "6.0 % of total"
4. **Tab strip** (under main row): **By asset class** (active) · By company · By sector · By account.
5. **Four AssetClassCards** in a row (gap 16):
   - **Equity** · "N holdings" · **₹5,52,800** · "65.8 % of total"
   - **ETF** · **₹1,00,000** · "11.9 % of total"
   - **Mutual fund** · **₹67,200** · "8.0 % of total"
   - **Bond** · **₹50,000** · "6.0 % of total"
   - REIT ₹40,000 · 4.8 % and InvIT ₹30,000 · 3.6 % appear after "See all". Footnote `caption`: "% of imported, valued portfolio as of 29 Sep 2026. Rounded; may not add to 100.0." (counts "N holdings" come from the fixture, never typed by hand.)
6. **Needs attention card** (Needs review tokens, full width, hidden when zero): icon + "3 open issues" + "1 mismatch, 1 unrecognized security, 1 missing price" + chevron → S17.
7. **"My holdings" DataTable** (same spot as "My Stock"). Title `titleCard` "My holdings", buttons **Export** and **Filter**. Columns (with sort icons): **Holding · Account · Units · Status · Value · Share**. Sample rows:
   - Meridian Bank (avatar "M", sub "Equity") · Demat A · 100 · **Matched** · ₹1,40,000 · 16.7 %
   - Coastal Bank · Demat A · 40 · **Needs review** · ₹1,12,800 · 13.4 % *(derived)*
   - Broad Market ETF · Demat A · 100 · **Single source** · ₹1,00,000 · 11.9 %
   - Aster Industries · Demat A + B · 20 · **Matched** · ₹60,000 · 7.1 % *(derived)*
   Units for rows 1 to 3 come from the fixture; do not invent other values. Each row opens S15.
8. **Insights row** (two cards): "42 % of your imported, valued portfolio is in banking" (→ S21) and "Risk summary: 3 observations" (→ S27), each with grey threshold text and chevron.
9. **Learn card:** "Most valued holdings are equity. See how REITs, InvITs and bonds work." + text button "Start learning" → S32.
10. **DisclaimerFooter.**

States: no data → S06 prompt; stale prices → amber banner "Prices are from [date]"; offline strip at top. The total is never labelled "net worth" or "total wealth".

### 5.2 S15 Holding detail

Example: Aster Industries shares (the double-count test). Active sidebar item **Holdings**. Page header: back link "‹ Holdings", `pageTitle` **Holding detail**, right button **Show evidence** (primary) → S16. No buy/sell anywhere.

1. **Header card:** 48 px avatar "A", **Aster Industries** `titleCard`, grey "Equity · ISIN INESYN000004 (example)". Right: **StatusBadge Matched** and "⋯" menu.
2. **Main row (8 + 4):**
   - **Left chart card:** label "Total units" → `priceLarge` **20 units** → grey "Value **₹60,000** at ₹3,000 per unit (price as of 29 Sep 2026)" + TrustChip. Right: Dropdown pill **"All sources ▾"**.
     **Observation timeline** (stepped line). Y axis: 0, 5, 10, 15, 20, 25 units. X axis: Jun · Jul · Aug · **Sep** (active, `primary`). Points: CAS 31 Aug = 20; Broker A + Broker B 29 Sep = 12 + 8. Dark tooltip: "20 units" / "CAS · 31 Aug 2026". If fewer than two observations: EmptyState "Only one source reported this holding".
   - **Right "Key facts" card** (same spot as the Watchlist): header "Key facts" + grey link "Show evidence". 2 × 2 StatCards: Settled units **20** · Pending units **0** · Accounts **2** (Demat A, Demat B) · Value **₹60,000**.
3. **Account breakdown card:** "You own 20 units in total: 12 in Demat A, 8 in Demat B". Two tappable rows (→ S18) with account avatar, masked ID, units.
4. **Evidence summary card:** "Source: CAS dated 31 August. Broker A reports 12 units as of 29 September." Link "Show evidence" (→ S16).
5. **Understand this holding** list (chevrons): "How shares work" (→ S33 stock) · "Follow my money" (→ S26) · "Hidden Connections: Aster Industries" (→ S23).
6. **ExplainerEntryButton:** two pills "Ask in English" · "हिंदी में पूछें".
7. **Cost card:** "Cost basis unavailable or incomplete" with grey reason line.

Variants: pending quantity → extra line "20 pending settlement" (Pending tokens) separate from settled units. Not-valued holding → main number "Not valued", then "No dependable market price available" and units, face amount, terms. Stock split → corporate-action note.

### 5.3 S16 Evidence (right-hand side panel, 560 px, read-only)

Opens as a side drawer over the dashboard (mobile: full-height bottom sheet, radius 24 top, drag handle).

1. **Header:** close "×" · title **"Evidence"** · "⋯".
2. **Header row:** avatar, "Aster Industries" + `label` "INESYN000004 (example)". Right: **StatusBadge Matched** + `caption` "20 units counted".
3. **Two read-only InputCards** (lock icon, no caret):
   - "Reported by brokers" → **12 + 8** → pill "Demat A + Demat B"
   - "Reported by statement (CAS)" → **20** → pill "31 Aug 2026"
4. **Total row:** "Counted once (no double count)" ........ **20 units**
5. **Section header:** "Source observations" / "See more".
6. **Two EvidenceTables side by side:**
   - Left, header **SOURCE | UNITS**: "Broker A · Demat A · 29 Sep" **12** · "Broker B · Demat B · 29 Sep" **8** · footer **20**
   - Right, header **UNITS | SOURCE**: "CAS · Demat A + B · 31 Aug" **20** · footer **20**
   - No observation is ever shown as overwritten; older ones stay with the reason.
7. **"Why this status" card:** "12 + 8 across two accounts. The statement describes the same 20 units, so they are counted once."
8. **Links:** "View source record" · "Explain in हिंदी".
9. **Footer button:** **"Done"** (secondary). No transaction action.

**Needs-review variant (Coastal Bank):** badge **Needs review**; InputCards "Broker A says **40**" (29 Sep) and "CAS says **35**" (31 Aug); total row "Counted on latest source: **40 units**"; explanation "No transaction explains the 5-unit difference. Please check your statement." and button **"I've checked this"**.

---

## 6. All other screens (same shell, same components)

Notation: **PH** = page header, **PB** = primary button in PH, **SC** = Card, **DF** = DisclaimerFooter.

### 6.A Launch and onboarding (centred 480 px card, no shell)

**S01 Splash.** Logo tile 88 (`primary`, radius 24, white eye-on-rupee glyph), **DhanDrishti** 32 bold, **धनदृष्टि** `label`, tagline "Know what you own, where you own it, and what it means." 2 px `primary` progress bar at bottom. Error: "Something went wrong with stored data" + button "Reset app data".

**S02 Language select.** Title "Choose your language" / "अपनी भाषा चुनें". Two selectable cards: **English** ("Welcome to DhanDrishti") and **हिंदी** ("धनदृष्टि में आपका स्वागत है"). Selected: 2 px `primary` border + `primaryTint` bg + check. `caption` "You can change this later." Button **"Continue"**.

**S03 Intro walkthrough.** 240 px flat blue/grey illustration, title, two-line body, page dots (active `primary` 20 × 6 pill). Pages: 1 "One clear view of everything you own" · 2 "See where every number comes from" · 3 "Understand REITs, InvITs and bonds". "Skip" top right. Button "Next", last page "Get started".

**S04 Privacy and consent.** Title "Your data, your control". Four check rows: "Read-only: we never place orders or move money" · "We never see your broker password" · "You can delete everything any time" · "Educational, not investment advice". Expandable "How your data is used". Checkbox "I understand and agree". Button "Continue" (disabled `#C9D3EA` until checked).

**S05 App lock setup.** Title "Lock the app when you leave". Toggle "Lock app when I leave", list of what is protected (amounts, holdings, evidence). Button "Enable lock". Link "Not now".

### 6.B Connections (inside shell, sidebar item **Import data** / **Accounts**)

**S06 Connect hub.** PH "Bring your holdings together". Three large cards in a row (icon tile, title, one line): **Connect broker** "Live holdings, read-only" · **Upload statement** "CAS or CSV" · **Try sample portfolio** "Synthetic demo data". Below: `label` "What stays private" + DF. If data exists: title "Add more accounts" and a coverage summary row on top.

**S07 Broker list.** PH "Choose a broker". Cards: Zerodha, Upstox, Groww, Dhan, each with status line ("Not connected" / "Connected" / "Expired") and chip ("Live" / "Demo adapter" / "Needs partner access"). Last card "Connect another broker", chip "Demonstration". Groww `caption`: "Live authorization depends on confirmed partner access".

**S08 Broker connect.** PH = broker name. Logo placeholder 64. Two cards: "What we will read: your holdings, nothing else" and "What we will never do: place orders, move money, see your password or OTP". Three steps: 1 "Log in on the broker's page", 2 "Approve read access", 3 "Come back here". PB **"Continue to [Broker]"**; secondary "Use demo adapter instead" where live is unavailable. Offline: disabled + "You're offline".

**S09 Connection callback.** Centre progress list with check/spinner rows: "Verifying" · "Fetching holdings" · "Matching securities" · "Checking overlaps". Text button "Cancel". Failure: "We couldn't complete the connection" + "Try again".

**S10 Statement upload.** PH "Upload statement". Dashed-border drop zone (radius 14, `primaryTint`), upload icon, "Choose file" / "or drag and drop". `caption` "CAS-like PDF or CSV". Note: "The file is read once. Only the normalized result is kept." Password dialog: "Enter PDF password (used once, never stored)". Errors: "Unsupported file" · "File too large" · "Wrong password (2 attempts left)" · "We couldn't read this statement" + link "Try sample CSV format". Progress: "Reading file" · "Finding accounts" · "Matching securities" · "Checking for overlaps".

**S11 Import summary.** Check in `positiveBg` circle "Import complete" + source name. Cards: **Accounts found** (Demat A · Demat · CDSL · XXXX-1201 · 7 holdings · "Updated 29 Sep 2026"; Demat B; Folio 1; counts from fixture); **Coverage** ("3 accounts included" + link "Flag an account that's missing"); **Issues** ("3 open issues", rows → S17). `caption`: "One statement doesn't mean everything was found." PB **"View dashboard"**; secondary "Add another source".

**S12 Accounts and coverage.** PH "Accounts". StatCards: "Included 3" · "Stale 0" · "Missing 1". Account rows (avatar, masked ID, "Updated 29 Sep 2026", chip Connected / Stale / Expired with "Reconnect" / "Re-upload"). Section "Flagged as missing": "Groww account not connected". Button "Add another account".

### 6.C Portfolio

**S14 Holdings list.** PH "Holdings" + PB **Export Report**. Search "Search holdings or ISIN". Tab strip / chips: **All** (active) · Equity · ETF · Mutual fund · REIT · InvIT · Bond · Needs review. Left "Sort: Value ▾", right `caption` "14 holdings · ₹8,40,000 valued · 2 not valued". DataTable (same as My holdings) with value + StatusBadge + "2 accounts" caption. "Not valued" rows last: value "Not valued", `caption` reason ("No dependable market price" / "Unclassified"). Empty: "No holdings match".

**S17 Issues center.** PH "Issues". Tab strip: All · Needs review · Pending settlement · Unrecognized · Missing price. Issue cards: holding name, type badge, sources ("Broker A 40 vs CAS 35"), one-line explanation, chevron → S16. Button "I've checked this" (recorded, not hidden). Empty: "No open issues".

**S18 Account detail.** PH = "Demat A". Header card: avatar, "XXXX-1201 · CDSL", "Updated 29 Sep 2026", status chip. Big value **₹5,13,800**, label "Valued holdings in this account only" + TrustChip. HoldingRows with per-account units. Card "Reconciliation notes for this account". Buttons: "Reconnect" · "Re-upload" · "Remove data" (text, `#D9480F`). Never added to other account totals on this screen.

### 6.D Insights

**S20 Insights hub.** PH "Insights". Five large cards (icon tile, title, teaser, chevron), 2-col grid: "Concentration map: 42 % in banking" · "Hidden Connections: 4 holdings, 1 company" · "Follow my money" · "Risk insights: 3 observations" · "Cash-flow calendar" (hidden unless flag on). DF.

**S21 Concentration map.** PH "Concentration". Tab strip **By company · By sector · By asset class · By account**. CoverageBanner "Excluded: 2 not valued, 1 unclassified". Basis `label` "% of imported, valued portfolio as of 29 Sep 2026". Chart: donut (asset class, account) or ranked bars (company, sector), palette 2.3. Ranked list: name, %, ₹ value, TrustChip. **Observation card:** "42 % of your imported, valued portfolio is in banking" + `caption` "Threshold shown: 30 % (descriptive, not a judgement)" + links "Why is this concentrated?" (→ S43) · "See Hidden Connections" (→ S23). Fund lines "Look-through unavailable". "Unclassified" has its own grey slice.

**S22 Slice detail.** PH = slice name. `display` percentage + basis line. HoldingRows. Card "What concentration means" (short, neutral). Classification source row. Button "Ask about this".

**S23 Hidden Connections.** PH "Hidden Connections". Intro "Which of your investments depend on the same company?" **Before:** 4 separate cards with account labels: "Aster Industries shares · Demat A + B", "Aster 8.5 % bond · Demat A", "City Offices REIT · Demat B", "Energy Infrastructure InvIT · Demat B". PB **"Reveal hidden connections"**. **After:** graph canvas (centre node "Aster Industries", `primary` filled circle 72 px, white text; four spoke cards; `primary` 2 px lines draw in over 600 ms; labels `caption`: "Issues shares", "Owes payments on", "Pays rent to", "Purchases power from"). Under it a list repeating each link in words. Button **"See simulated announcement"**. Toggle chip "Learn view". Empty: "No shared dependencies found in the documented data". DF.

**S24 Connection path detail.** PH "Connection". Path: "Aster Industries → Pays rent to → City Offices REIT". Rows: Relationship type · Disclosed percentage (only if disclosed, "10 % of rental revenue") · Disclosure date · Source document. Buttons **"Show the connection"** (primary) and **"View source"** (secondary). Amber caution: "A tenant contributing 10 % of rent does not mean 10 % of your money is in that tenant."

**S25 Simulated announcement.** PH "Simulated announcement" + IllustrativeBadge + "Simulated". Announcement card: "Aster Industries announces a delay in the interest payment on the bond held in this portfolio." Four impact rows, each with "Show the connection":
- Bond: **Confirmed** (solid green) "Directly concerns your bond's payment"
- Shares: **Relevant** "You also own equity in the issuer"
- REIT: **Connected** (dashed) "Disclosed tenant. No evidence here that rent is delayed"
- InvIT: **Connected** (dashed) "Disclosed power purchaser. No infrastructure payment delay established"
No predicted loss anywhere. DF.

**S26 Follow my money.** PH "Follow my money". Holding header. Segmented: **Accounts · Assets and issuers · Cash flows**. Missing data: "Not disclosed in available documents". Cash-flow rows carry a chip: Scheduled / Announced / Estimated / Confirmed received. Fixed note: "REIT units give exposure through the trust; you don't directly own a particular office. Underlying assets explain this holding and are not added to your portfolio value."

**S27 Risk summary.** PH "Risk insights". Header "What could go wrong" + note chip "Scenario-based, not a prediction". Risk cards (icon, one-line observation, descriptive level chip with threshold, TrustChip, chevron → S28): concentration, shared dependency, interest rate, credit or default, liquidity, distribution, data and coverage. **Stress test card:** "Try a stress test" + button → S29. DF "Educational, not investment advice".

**S28 Risk detail.** PH = risk name, LanguageToggle chip. Plain-language explanation, "Your holdings affected" HoldingRows, Evidence card (source, data date, assumptions), linked tools row, ExplainerEntryButton.

**S29 Stress test.** PH "Stress test" + IllustrativeBadge. Scenario chips: Sector downturn · Yield rise · Payment delay. InputCards with steppers ("Assumed fall **10 %**"). **ValueDeltaRow** "Original ₹8,40,000" / "Under these assumptions ₹…" (from engine). AssumptionsPanel. Explanation "Under these assumptions, ...". PB **"Open in What-if lab"**.

**S30 Cash-flow calendar (P1).** PH "Cash-flow calendar". Month header with arrows, calendar grid (marker dots `primary`). List: item name, account, amount, label chip (Scheduled / Announced / Estimated / Confirmed received). Filters: account, type, "Historical" toggle.

### 6.E Learn

**S32 Learn home.** PH "Learn" + LanguageToggle. PromoCard (blue) "Most valued holdings are equity" / "See how REITs, InvITs and bonds work" / white button "Start". 2 × 2 grid: REIT, InvIT, Bond, Stock. Rows: "Compare side by side", "Try a guided simulation", "What if? lab", "Glossary". DF.

**S33 Instrument explainer.** PH = instrument name. One-line simple explanation. Cards: **How returns arise**; **Main risks and Benefits** (two columns, same card); **Liquidity**; **What to inspect** (table). Contextual prompt if held (bond: "An 8 % coupon describes payments relative to face value. Your return if you buy at today's price can differ."). Link "View source · reviewed [date]". ExplainerEntryButton.

**S34 Comparison view.** PH "Compare". Table, sticky first column, columns Stock · REIT · InvIT · Bond; rows Income · Price changes · Liquidity · Risk. Benefits and risks stay in one cell group. Click cell → short explanation popover.

**S35 Bond interactive (P1).** PH "Bond and yield" + IllustrativeBadge. "If the price of a fixed-coupon bond rises, what happens to its yield?" Price slider (`primary` thumb). Tiles "Coupon ₹85 (fixed)", "Price ₹…", "Yield direction". "Coupon rate and yield to maturity are different concepts." AssumptionsPanel.

**S36 Guided simulations list.** PH "Guided simulations". Five cards, each IllustrativeBadge + "You will learn": Change a bond's market yield · Reduce a REIT's assumed distribution · Delay a bond payment · Reduce an InvIT's assumed distribution · Choose an earlier exit date.

**S37 Simulation player.** PH = lesson title + IllustrativeBadge. InputCard for the variable. Result StatCards. Worked example (exact): "Starting value **₹10,000** · Ending market value **₹9,000** · Distributions received **₹600** · Combined ending value **₹9,600**". Teaching line: "Receiving cash does not mean the investment made a profit." Note: "Simplified: no other cash flows, fees or taxes." AssumptionsPanel. Button "Next" / "Finish".

**S38 Understanding check (P1).** PH "Check your understanding". "Explain the result in your own words" (free text or choose-a-statement). Feedback card with misconception + short explanation using the scenario's numbers. Button "Submit". Note: measures understanding of the lesson only.

**S39 Glossary.** PH "Glossary". Search field. Alphabetical list (coupon, yield, distribution, ISIN, face value, maturity, liquidity, tenant...). Term detail: definition, example, same term in the other language.

### 6.F What-if lab

**S40 Lab home.** PH "What if? lab" + IllustrativeBadge; "Nothing here is real investing". Two large cards: **Copy my imported portfolio** · **Start with a virtual amount** (InputCard default **₹10,000**, editable). "Saved allocations" list. Five scenario explainer rows.

**S41 Lab workspace** (Transaction-style layout, editable, virtual only).
1. PH: allocation name · reset.
2. Two **InputCards** (editable): "Virtual amount" **₹10,000** with pill "INR ▾" and "Units" **29** with Stepper.
3. Total row: "Total virtual value" **₹…**
4. "Virtual allocation" list + button "Add instrument" (→ S42).
5. Scenario chips: Market yields · Distribution cut · Payment delay · Equity fall · Earlier exit; each with editable inputs.
6. **ValueDeltaRow** (Original vs Under these assumptions): portfolio value, cash received, concentration shift (small bars).
7. "What you learn" card. AssumptionsPanel. ExplainerEntryButton.
8. PB **"Save allocation"**. No buy/sell language.

**S42 Add instrument picker.** PH "Add instrument". Tabs: Stock · REIT · InvIT · Bond. Rows: name, type chip, issuer, short description, `caption` disclosure date, "Add" text button → amount InputCard in a side panel with button "Add to allocation".

### 6.G Ask

**S43 Explainer chat.** PH "Ask" + LanguageToggle (English / हिंदी). Suggested chips (pill): "Why is my portfolio concentrated?" · "Explain this bond in Hindi" · "Which of my accounts holds this REIT?" · "What could go wrong with this InvIT?". Bubbles: user = `primary` fill, white text, radius 16 (bottom-right 4); assistant = `surfaceMuted`, `textPrimary`. Under assistant messages: **Sources** chips (`primaryTint`) and TrustChip when numbers appear. Grounded-missing reply: "I don't have that in your data or documents." Input bar: field radius 24 + circular `primary` send button. DF. Prefill from other screens is editable before send. Thinking: three animated dots. Desktop: chat column max 760 px centred.

### 6.H Settings

**S45 Settings home.** PH "Settings". Grouped list rows (icon tile, title, chevron): Accounts and coverage · Language · App lock (toggle) · Screenshot protection (toggle) · Privacy and data · About and disclaimers · Demo controls (dev only).

**S46 Language and glossary.** PH "Language". Two selectable cards (English, हिंदी). `caption`: "More languages will be added as reviewed content becomes available." Row "Glossary".

**S47 Privacy and data.** PH "Privacy and data". Card "What is stored": "Normalized holdings only. No passwords, no full PAN, no CAS passwords." Toggle "Privacy mode by default". Rows: "Delete imported data" (all / per account → confirm dialog). "Consent given on [date]". Text button "Withdraw consent" (`#D9480F`).

**S48 About and disclaimers.** PH "About". App version. Full "Educational, not investment advice" statement. "DhanDrishti is read-only and is not an approved FIU." Data-source notes. "Demo data is synthetic." Credits.

**S49 Demo controls (dev).** PH "Demo controls". Segmented **Sample · Mock API · Live**. Buttons: "Load sample portfolio", "Load mismatch scenario", "Reset all data". Toggles: "Simulate stale prices", "Simulate disconnected broker", feature flags.

---

## 7. Shared states (every screen)

| State | Visual |
|---|---|
| Loading | Skeleton blocks in `surfaceMuted` shimmer matching the final layout |
| Empty | 64 px outlined icon, `bodyStrong` message, `label` helper, primary button |
| Error | Plain-words message, "Try again", optional "Use last known data" |
| Partial | Content + amber CoverageBanner naming what is missing |
| Stale | Content + amber banner with date and fix action |
| Offline | Top strip `#EEF1F5` "You're offline. Showing last known data", dates on every number |

---

## 8. Hindi key labels (unreviewed, needs fluent-speaker review before demo)

| English | हिंदी |
|---|---|
| Dashboard | डैशबोर्ड |
| Holdings | होल्डिंग्स |
| Insights | इनसाइट्स |
| Learn | सीखें |
| Ask | पूछें |
| Total valued holdings | कुल मूल्यांकित होल्डिंग्स |
| Export Report | रिपोर्ट निर्यात करें |
| Show evidence | प्रमाण देखें |
| Matched | मिलान हुआ |
| Single source | एक स्रोत |
| Pending settlement | निपटान लंबित |
| Needs review | समीक्षा ज़रूरी |
| Illustrative | उदाहरण मात्र |
| Reveal hidden connections | छिपे संबंध दिखाएँ |
| Educational, not investment advice | शैक्षिक जानकारी, निवेश सलाह नहीं |

Latin digits for all financial figures in both languages.

---

## 9. Checklist for the AI tool (paste with this file)

- Layout, colours, spacing and component shapes follow the Stockate reference; text and data follow this file.
- No buy, sell, order or invest control anywhere. No forecast, profit, gain/loss or advice wording.
- Green/red are used only for status (Matched / Needs review), never for gains or losses.
- Every number can open SourceInfoSheet through a TrustChip.
- Every simulation screen has IllustrativeBadge + AssumptionsPanel.
- Status is never colour-only (icon + label).
- All text from ARB files; Hindi layout tested for overflow.
- Amounts in Indian format; privacy-mode eye hides every amount.
- Sample numbers must equal the engine's expected results (Architecture Section 18); *(derived)* numbers must be re-verified.
- Charts plot only real observations or snapshots; never an invented curve.
