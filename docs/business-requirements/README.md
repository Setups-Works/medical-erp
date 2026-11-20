# Business requirements

Owner: Prakalya. Flow: **BRD** (why/what, per area) → **FRS** (exact behaviour, fields, rules, per module) → **User stories** (buildable slices, 1 issue each) → **UAT scripts**.

```
brd/            BRD-<area>.md            e.g. BRD-purchase.md
frs/            FRS-<module>.md          e.g. FRS-inventory.md, PERMISSIONS.md
user-stories/   <FEATURE-ID>-<slug>.md   e.g. PUR-02-purchase-invoice-entry.md
uat/            UAT-<phase>.md
templates/      templates for all of the above
```

Rules: use glossary terms; numbers not adjectives ("warn 90 days before expiry", not "warn early"); mark unknowns `⚠ VERIFY`; link feature IDs from `docs/product/FEATURES.md`.
