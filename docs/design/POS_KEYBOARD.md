# POS keyboard map (draft — Meyyarivu finalises in P0, Prakalya validates with pharmacists)

| Key | Action | Notes |
|---|---|---|
| `F2` | Focus item search | Default focus after every action |
| `F3` | Select / add customer | Phone number search first |
| `F4` | Doctor & prescription | Mandatory dialog for H1/X items |
| `F6` | Hold bill | |
| `F7` | Recall held bill | |
| `F8` | Bill discount | Limited by role |
| `F9` | Payment panel | Split payments |
| `F10` | Save & print | Idempotent: double press never creates two bills |
| `F12` | Sales return mode | |
| `Enter` | Confirm / open batch picker | |
| `Esc` | Close dialog / cancel current line edit | |
| `Ctrl+Del` | Remove line | Confirm if bill is from recall |
| `↑ ↓` | Move between lines | |
| `+` / `-` | Qty up / down on current line | |
| `Ctrl+L` | Loose quantity entry | |
| `?` | Shortcut help sheet | |

Barcode scanners act as keyboards ending with `Enter`; the search input detects a scan (fast keystrokes) and adds the item directly.
