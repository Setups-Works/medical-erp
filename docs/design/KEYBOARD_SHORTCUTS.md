# Keyboard shortcuts

> Owner: Meyyarivu (registry, shortcut sheet, screens) · Nitheesh (desktop menu accelerators in Electron main) · QA: Ashok · Pharmacist check: Prakalya.
> Features: NAV-02 (command search), NAV-04 (global shortcuts), NAV-05 (transaction screens), NAV-03 (desktop menu bar), MKT-08 (per-user customisation). The POS counter has its own map: [POS_KEYBOARD.md](POS_KEYBOARD.md).

MENO is used all day at counter PCs. Every screen must be usable **without a mouse**, and the same key must mean the same thing everywhere.

## Rules

1. **One registry.** All shortcuts live in `apps/web/src/config/shortcuts.ts` (generated from the tables below in P2, NAV-04). Components call `useShortcut("nav.goto.pos")`; nobody writes `if (e.key === "F9")` in a screen (rule 13: no hard-coding).
2. **Scopes:** `screen` (POS, purchase grid…) beats `global`. A screen may reuse a key only for the same meaning listed here.
3. **Never in text fields:** single-letter and `G`/`N` sequences are ignored while typing in an input, textarea or grid cell. Modifier and F-keys work everywhere.
4. **Web-safe:** the web app never takes keys the browser reserves (`Ctrl+N`, `Ctrl+T`, `Ctrl+W`, `Ctrl+Tab`, `Ctrl+Shift+N/T/W`). The desktop app may use them in its menu (below).
5. **Visible:** every shortcut appears in the shortcut sheet (`Ctrl+/`), in button tooltips (`Save · Ctrl+S`), in command search results and in the desktop menu.
6. **Permission-aware:** a shortcut to a screen or action the user can't use does nothing and shows "You don't have access" once.
7. **Customisable** per user (MKT-08, P5) from **Profile → Keyboard shortcuts** (`/me/shortcuts`), with conflict detection and "reset to default". Custom keys are stored per user and synced to the desktop.
8. **Accessible:** shortcuts are an addition, never the only way; focus is always visible; `Esc` always backs out one level.

## Global (every screen)

| Keys | Action | Desktop menu |
|---|---|---|
| `Ctrl+K` | Command search: any menu item, medicine, party, document number (NAV-02) | View |
| `Ctrl+/` | Shortcut sheet for the current screen | Help |
| `F1` | Help for the current screen | Help |
| `Ctrl+B` | Show / hide sidebar | View |
| `Alt+←` / `Alt+→` | Back / forward | Go |
| `Ctrl+Alt+B` | Switch branch | File |
| `Ctrl+Alt+L` | Lock screen (PIN to unlock; counter keeps the held bills) | File |
| `Ctrl+Alt+T` | Light / Dark theme | View |
| `Esc` | Close dialog, cancel the current edit, or leave the field | — |

## Go to (press `G`, then the key, within 1 second)

| Keys | Screen | Route |
|---|---|---|
| `G H` | Home dashboard | `/dashboard` |
| `G P` | POS billing | `/sales/pos` |
| `G I` | Sales invoices | `/sales/invoices` |
| `G O` | Sales orders (wholesale) | `/sales/orders` |
| `G E` | Sales returns | `/sales/returns` |
| `G Q` | Purchase orders | `/purchase/orders` |
| `G U` | Purchase invoices | `/purchase/invoices` |
| `G N` | Goods received | `/purchase/grn` |
| `G K` | Stock overview | `/inventory/stock` |
| `G X` | Expiry management | `/inventory/expiry` |
| `G M` | Medicine master | `/masters/items` |
| `G C` | Customers | `/masters/customers` |
| `G V` | Suppliers (vendors) | `/masters/suppliers` |
| `G D` | Doctors | `/masters/doctors` |
| `G A` | Ledger groups | `/finance/account-groups` |
| `G L` | Ledgers (chart of accounts) | `/finance/accounts` |
| `G B` | Cash & bank | `/finance/cash-book` |
| `G J` | Journal entries | `/finance/journal` |
| `G W` | Bulk billing (wholesale) | `/wholesale/billing` |
| `G R` | Reports centre | `/reports` |
| `G T` | GST summary | `/gst` |
| `G Z` | Statutory registers | `/compliance/registers` |
| `G ,` | Settings home | `/admin` |

## Create new (press `N`, then the key)

| Keys | Opens | Desktop menu |
|---|---|---|
| `N S` | New POS bill | New |
| `N I` | New sales invoice | New |
| `N O` | New sales order | New |
| `N Q` | New purchase order | New |
| `N U` | New purchase invoice | New |
| `N T` | New stock transfer | New |
| `N R` | New receipt | New |
| `N P` | New payment | New |
| `N E` | New expense | New |
| `N J` | New journal entry | New |
| `N M` | New medicine | New |
| `N C` | New customer | New |
| `N V` | New supplier | New |
| `N L` | New ledger | New |

## Lists (every ListPage)

| Keys | Action |
|---|---|
| `/` | Focus the search box |
| `↑` `↓` | Move between rows |
| `Enter` | Open the selected row |
| `C` | Create new (same as the list's "New" button) |
| `Space` | Select / unselect row (bulk actions) |
| `Ctrl+E` | Export the current view |
| `[` / `]` | Previous / next page |

## Forms and documents (masters, vouchers, purchase, sales invoices)

| Keys | Action | Notes |
|---|---|---|
| `Enter` / `Tab` | Next field | `Shift+Tab` back |
| `Ctrl+S` | Save draft | Masters: save |
| `Ctrl+Enter` | Post / submit | Confirm dialog; idempotent (rule 7) |
| `Ctrl+P` | Print | Desktop: silent print to the counter's printer profile |
| `Ctrl+Shift+P` | Print preview | |
| `Ctrl+D` | Duplicate the current line | |
| `Esc` | Cancel the edit (asks if there are unsaved changes) | |

## Transaction grids (purchase entry, sales invoice, transfers, journals; NAV-05)

Same meaning as at the POS wherever the action exists.

| Keys | Action |
|---|---|
| `F2` | Item search (barcode scan works here too) |
| `F3` | Party: supplier / customer |
| `F4` | Doctor & prescription (sales with Schedule H/H1/X items) |
| `F5` | Batch picker for the current line (FEFO default) |
| `F8` | Bill / document discount (limited by permission) |
| `F9` | Payment / settlement panel |
| `F10` | Save & post (confirm) |
| `Ctrl+Del` | Remove line |
| `Ctrl+↓` | New line |
| `↑` `↓` `←` `→` | Move between cells |
| `+` / `-` | Quantity up / down |

## Desktop only

| Keys | Action |
|---|---|
| `Ctrl+Alt+S` | Sync now (DSK-02) |
| `Ctrl+Alt+Y` | Open "Sync issues" |
| `Ctrl+Shift+N` | New window (for example a report next to POS) |
| `Ctrl+=` / `Ctrl+-` / `Ctrl+0` | Zoom in / out / reset |
| `F11` | Full screen (counter mode) |
| `Alt` + underlined letter | Open a menu in the menu bar (Windows) |

Disabled in production builds: page reload (`F5`, `Ctrl+R`) and developer tools (`Ctrl+Shift+I`), so a mis-press never loses an open bill. `F5` is free for screens, e.g. the batch picker in transaction grids (the web app also stops the browser reload on those screens).

## Reserved for later

`F6`, `F7`, `F12` stay POS-only (hold, recall, return mode). Don't assign `Alt+letter` in the desktop app: Windows uses it for the menu bar.
