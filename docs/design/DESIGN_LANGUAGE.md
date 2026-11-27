# Design language — read this before you build any UI

MENO uses the **"paper and ink"** design language: a restrained, near-monochrome surface — white (or charcoal, in dark mode) paper, charcoal ink, 1 px hairline borders, almost no shadow, **Geist** everywhere with tight, heavy headings, and colour reserved for **status** (expiry, stock, payment, schedule) and the one accent the tenant picks. Every screen must look like it came from the same hand. Decoration (gradients, glows, glass blur, big shadows, pastel washes behind whole cards) is **wrong here**.

An ERP adds two needs to that language: **dense data** (tables, grids, numbers) and **speed at the counter** (keyboard-first POS). Sections 7–9 cover them.

> Source of truth for values: `packages/ui/src/tokens/tokens.css` (`:root`) and `packages/ui/src/tokens/theme.css` (`@theme inline` mapping for Tailwind v4). This file explains how to use them. Built with **shadcn/ui (style `new-york`, base colour `neutral`, CSS variables, lucide icons)** — shadcn variables are mapped onto our tokens, so shadcn components inherit the look.

## 1. Typography

| Use | Font | Notes |
|---|---|---|
| Page titles, dialog titles, big numbers (KPIs) | **Geist 600** (`font-display`) | Tracking `-0.022em`; page title `text-[clamp(26px,3vw,32px)] leading-[1.1]` |
| Everything else (UI, body, buttons, tables) | **Geist** (`font-sans`) | Body 14–15 px; table cells 13.5–14 px; labels 12–13 px; never below 11 px |
| Numbers in tables, amounts, qty, batch no., invoice no., shortcuts | **Geist Mono** (`font-mono`) + `tabular-nums` | Right-aligned in tables |
| MENO wordmark only | **Instrument Serif** (`font-brand`) | Sidebar header, login, printed invoice header. Nowhere else |
| Tamil / Hindi | Noto Sans Tamil / Devanagari | Loaded automatically (P7) |

Form controls don't inherit font by default: shadcn inputs in `packages/ui` already set `font: inherit`; never use a bare `<textarea>`.

## 2. Colour tokens

**Never write a hex colour in a component.** Use tokens (Tailwind names in brackets).

| Token | Light | Dark | Tailwind | Role |
|---|---|---|---|---|
| `--paper` | `#ffffff` | `#191919` | `bg-paper` | Canvas |
| `--side` | `#f7f7f7` | `#202020` | `bg-side` | Sidebar, table header, input fill |
| `--raised` | `#ffffff` | `#232323` | `bg-raised` | Cards, popovers, dialogs |
| `--sunken` | `#f0f0f0` | `#2b2b2b` | `bg-sunken` | Wells, disabled fields |
| `--ink` → `--ink-4` | `#242424` `#5c5c5c` `#707070` `#8f8f8f` | `#ebebeb` `#b3b3b3` `#8a8a8a` `#737373` | `text-ink`…`text-ink-4` | Text strongest → faintest |
| `--line` `--line-2` `--line-3` | `#ebebeb` `#dedede` `#8f8f8f` | white 8/13/34 % | `border-line`… | Hairlines, stronger borders, emphasis |
| `--hover` `--press` | ink 5 % / 8 % | white 5 % / 9 % | `bg-hover` `bg-press` | Interaction fills |
| `--critical` | `#bc2a41` | | `text-critical` | Errors, expired, blocked |
| `--success` | `#2d8659` | | `text-success` | Paid, synced, in stock |
| `--warning` (`--f-amber`) | `#c2923a` | | `text-warning` | Near expiry, low stock, credit warning |
| `--coral` | `#dd7b5e` | | `text-coral` | Warm attention (unread, selected day) |
| `--data` | `#2f7ab0` | | `text-data` | Links, focus ring, chart series 1 |
| `--f-blue/green/amber/red/violet/pink/slate` | muted earthy | | `at-<tint>` | Categories, tags, charts |
| `--accent-color` / `-wash` / `-line` | ink by default | | `bg-accent` | Tenant's chosen accent (Settings → Appearance: ink, ocean, grove, iris, rose, teal, slate) |

shadcn mapping (in `theme.css`): `--background → --paper`, `--foreground → --ink`, `--card/--popover → --raised`, `--muted → --side`, `--muted-foreground → --ink-3`, `--border/--input → --line-2`, `--ring → --data`, `--primary → --ink`, `--primary-foreground → --paper`, `--destructive → --critical`, `--accent → --hover`.

**Schemes:** Light (default) and Dark — class `dark` on `<html>`. Accent: `data-accent` on `<html>`. Every new colour must work in both schemes.

### Status colours (ERP-specific — use these exact mappings)

| Meaning | Tint | Example |
|---|---|---|
| Expired / blocked / banned / overdue > 90 d | `critical` | Batch row, item badge |
| Near expiry (≤ setting days) / low stock / credit limit near / overdue | `amber` | Badge "Exp 03/27" |
| OK / paid / synced / posted | `success` (text only, no fill on whole rows) | "Posted" badge |
| Draft / held / pending sync | `slate` | "Draft" badge |
| Schedule H | `blue` badge "H" | |
| Schedule H1 | `violet` badge "H1" | |
| Schedule X / NDPS | `red` badge "X" | |
| Cold chain | `blue` icon `Snowflake` | |

Colour is never the only signal: always text or an icon too.

## 3. Surfaces

Cards: flat `bg-raised` with a 1 px `--line` inset ring, 12 px corners, **no shadow**. Only floating layers (menus, popovers, dialogs, command palette) get `shadow-pop`.

Radii: `rounded-xs` 4 (badges) · `rounded-tab` 6 (tabs, icon buttons) · `rounded-ctl` 8 (buttons, inputs) · `rounded-tile` 10 · `rounded-card` 12 · `rounded-dlg` 16 · `rounded-pill` (filter pills only). Never `rounded-md`/`shadow-md`/`shadow-lg`.

## 4. Controls

| Control | Use |
|---|---|
| Primary | `<Button>` default variant — ink block, 32 px (40 px touch), 13 px/500. **One per view.** |
| Secondary | `<Button variant="outline">` — raised with `--line-2` outline |
| Ghost / icon | `<Button variant="ghost" size="icon">` + `aria-label` |
| Destructive | `<Button variant="destructive">` and always `useConfirm({ danger: true })` first |
| Filter pill | `<FilterPill>` — 28 px; selected = ink pill |
| Segmented | `<Segmented>` grey track + raised active segment |
| Select / combobox | shadcn `Select` / `Combobox` from `@meno/ui` — never native date/time inputs; use `<DatePicker>` |
| Suggest input | `<SuggestInput>` from `@meno/ui` — free text with a dropdown of likely answers (City from the PIN's post offices). ↑/↓, Enter, Esc. Never a native `<datalist>` |
| Menus, dialogs, sheets | Radix-based components from `@meno/ui` only |

Hover `--hover`, pressed `--press`, 140 ms `--ease`. Focus ring from global `:focus-visible` (2 px `--data` 55 %) — never remove it.

## 5. Layout

- **App shell** (menu items: [NAVIGATION.md](NAVIGATION.md)): 48 px icon rail expanding to a 264 px labelled sidebar (pushes content ≥ 1280 px, overlays below), 48 px top bar with breadcrumb, **branch switcher**, sync status (desktop), search (`Ctrl K`), notifications, user menu.
- Page root: `mx-auto w-full max-w-[1280px]` (back office), full-width for POS and document-entry grids.
- Page header: display title left, primary action right, tools row below (filters, tabs, export), `mb-[18px]`.
- Card padding 16–22 px; gaps 8 / 12 / 18. Hit targets ≥ 36 px (desktop), 40 px (touch).
- Breakpoints: counter PCs are **1280×720 / 1366×768** — design for these first; must not break at 375 px (back-office pages usable on phone; POS shows "use desktop" on < 768 px).

## 6. Motion

Controls 140 ms, panels 200–240 ms with `--ease-out`, no bounce, no lift-on-hover. Respect `prefers-reduced-motion` and `html[data-motion="reduce"]`. **POS has no animations on the billing path** — speed over flourish.

## 7. Data tables (`<DataTable>` in `@meno/ui`, TanStack Table)

- Header row `bg-side`, 12.5 px/500 `text-ink-3`, sticky.
- Rows 40 px (comfortable) / 32 px (`data-density="compact"`), hairline dividers, hover `bg-hover`, selected `bg-accent-wash`.
- Numbers right-aligned, `font-mono tabular-nums`; text left; status badges centre.
- Pagination server-side; column visibility + saved views per user; export (Excel/PDF) in the tools row.
- Empty state: one quiet line + next action. Loading: skeleton rows, not spinners.

## 8. Money, quantity and dates

- Money from API as **strings**; format with `formatMoney()` from `@meno/ui` → `₹1,23,456.50` (en-IN grouping). Negative amounts `−₹120.00` in `text-critical` only where it means "owed/overdue".
- Quantity: `10 + 1 free` shown as `10` and a small `+1` badge; loose units as `1 strip 3 tab`.
- Dates: `dd MMM yyyy` (`21 Nov 2026`); expiry as `MM/yy` (`03/27`) like on the pack; times `hh:mm a`. Financial year label `FY 2026-27`.
- Invoice / batch numbers in mono.

## 9. POS and keyboard-first screens

- Layout: left = item lines grid (70 %), right = customer, totals, payments (30 %). Search bar always focused after each action.
- Every action has a shortcut, shown as `<Kbd>` in buttons and the `?` help sheet. Proposed defaults (finalised in `docs/design/POS_KEYBOARD.md`): `F2` search item · `F3` customer · `F4` doctor/Rx · `F6` hold · `F7` recall · `F8` discount · `F9` payment · `F10` save & print · `Esc` back/cancel line · `Ctrl+Del` delete line · `↑/↓` move rows · `Enter` confirm.
- Batch picker opens inline on Enter; FEFO batch preselected; expired rows disabled with reason; near-expiry rows amber.
- Totals block: big Geist 600 mono grand total, GST breakup collapsible.
- Never block the cashier with a modal unless it's a legal requirement (Rx for H1) or a destructive action.

## 10. Content and tone

Sentence case everywhere ("New purchase", "Post invoice"). Short, friendly, no exclamation marks. Errors say what to do: "Batch B123 expired on 03/26. Pick another batch." Never show raw error codes. Use pharmacy terms from the glossary exactly. Icons: lucide only via `<Icon name="…" />`; no emoji.

## 11. Printed documents

Invoice templates (thermal 58/80 mm, A5, A4) use the same fonts, black ink only, hairline rules, MENO wordmark small in the footer ("Billed with MENO"). Must include legally required fields (GSTIN, DL nos., HSN, batch, expiry, Rx details for H1) — see `docs/compliance/COMPLIANCE.md`.

## 12. Checklist before you open the PR

- [ ] Compared side by side with an existing reference screen at 1366 px and 375 px
- [ ] Tokens only; no raw hex, `gray-*`, `bg-white`, default shadows/radii
- [ ] Light, Dark and a coloured accent all look right
- [ ] Numbers mono + right-aligned; money via `formatMoney()`
- [ ] Keyboard: everything reachable, visible focus, shortcuts listed; labels on icon buttons
- [ ] Status never conveyed by colour alone
- [ ] Reduced motion and compact density respected
- [ ] `pnpm check:design` passes

## 13. Enforcement

`scripts/design/check-design.mjs` (P1) scans added lines for hex colours, Tailwind default palette, default shadows/radii, text < 11 px, hand-set fonts, native `alert/confirm/prompt`, native date inputs and `any`. It runs in the pre-commit hook, in a Claude Code hook after edits, and in CI. Real exceptions: `// design-ok: <reason>` on the line.
