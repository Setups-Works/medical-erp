# Capability coverage

Checks that MENO covers every capability a pharmacy retail + wholesale ERP must have. Each row lists the feature IDs ([FEATURES.md](FEATURES.md)) that deliver it. MENO Hub shows this table on its **Product map** page, with live progress per capability.

| Capability | Feature IDs | Notes |
|---|---|---|
| Retail billing | POS-01, POS-02, POS-03, POS-07, POS-10, POS-12 | Keyboard-first POS, batch picker, multi-payment, printing |
| Wholesale billing | WHS-01, WHS-02, WHS-03, WHS-04, WHS-06 | Orders → invoice, credit, e-invoice |
| Batch management | INV-01, INV-02, INV-03, PRC-01 | Batch-wise stock with movement ledger, FEFO |
| Expiry management | INV-04, INV-05, RET-04, RPT-05, MKT-07 | Block expired, near-expiry dashboard, expiry returns |
| Purchase management | PUR-01, PUR-02, PUR-03, PUR-04, PUR-07, PUR-11 | PO, invoice, GRN, CSV import, reorder |
| Supplier returns | RET-03, RET-04, MKT-04 | Purchase returns, expiry/breakage claims, debit notes |
| Customer ledger | PTY-06, ACC-01, ACC-09, CRM-01 | Ledger, receipts, ageing, customer history |
| GST workflows | GST-01, GST-02, GST-03, GST-04, GST-05, GST-06 | Tax calc, HSN summary, GSTR exports, e-invoice/e-way |
| Accounting | ACC-03, ACC-04, ACC-06, ACX-01, ACX-03, ACX-07 | Double entry, vouchers, books, final accounts |
| Multi-branch | PLT-02, PLT-03, INV-08, MKT-06 | Companies, branches, warehouses, transfers |
| Offline operation | POS-15, DSK-02, DSK-05 | Desktop offline billing with safe sync |
| Distributor ordering ecosystem | MKT-03, WHS-10 | Retailer → distributor ordering between MENO tenants |
| Prescription handling | POS-06, CMP-01, CMP-03, PTY-05 | Rx capture, H1 register, doctor master |
| Salesman management | DOC-04, WHS-09, DOC-03, MOB-02 | Salesman master, commission, field app |
| Centralized chain dashboard | MKT-10, RPT-10, RPT-01 | Consolidated multi-branch dashboard |
| Complaints & customer care | CRM-02, CRM-01 | Added after the sidebar review |
| Navigation | NAV-01, NAV-02 | Sidebar from NAVIGATION.md, command search |
