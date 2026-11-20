# @meno/ui — AGENTS.md

Owner: Meyyarivu. The design system. Read `docs/design/DESIGN_LANGUAGE.md` first.

```
src/tokens/      tokens.css (:root palette, dark scheme, accents), theme.css (@theme inline → Tailwind + shadcn vars)
src/components/  shadcn new-york components adapted to tokens (button, input, select, combobox, dialog, sheet,
                 dropdown-menu, tabs, table, data-table, badge, kbd, date-picker, toast, confirm, empty-state,
                 skeleton, filter-pill, segmented, page-header, stat-tile)
src/icons/       Icon component mapping names → lucide
src/format.ts    formatMoney (en-IN, ₹), formatQty, formatDate, formatExpiry (MM/yy)
```

Rules: add shadcn components with the CLI, then replace any default colours/radii/shadows with tokens. New token = add to `tokens.css` (all three schemes) + `theme.css` mapping + DESIGN_LANGUAGE table, approved by Nitheesh. Every component: keyboard accessible, `forwardRef`, `className` merge via `cn()`, story/example in `docs/design/components.md`.
