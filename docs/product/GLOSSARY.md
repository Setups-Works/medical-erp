# Pharmacy & ERP glossary

> For developers and AI agents with no pharmacy background. Use these exact terms in code, UI and issues. Code name in `monospace`.

| Term | Meaning | Code name |
|---|---|---|
| **Tenant** | The business that subscribes to MENO | `Tenant` |
| **Company** | A legal entity (own GSTIN) under a tenant | `Company` |
| **Branch** | A shop or warehouse with its own stock | `Branch` |
| **Edition** | Retail or Wholesale feature set, set per company | `Edition` |
| **Item / Medicine** | A sellable product. Medicine = item with pharma attributes | `Item` |
| **Generic name / Salt / Composition** | Active ingredient(s) and strength, e.g. Paracetamol 650 mg | `Composition` |
| **Brand** | Commercial name, e.g. Dolo 650 | `brandName` |
| **Manufacturer / Marketer** | Company that makes / sells the product | `Manufacturer` |
| **Dosage form** | Tablet, capsule, syrup, injection, ointment… | `DosageForm` |
| **Pack** | Selling unit, e.g. strip of 10 tablets (1×10) | `packSize` |
| **Loose sale** | Selling part of a pack (3 tablets from a strip) | `looseQty` |
| **Batch** | A production lot with its own batch no., mfg date, expiry, MRP | `Batch` |
| **Expiry** | Date after which the batch must not be sold | `expiryDate` |
| **Near expiry** | Batch expiring within N days (setting) | `nearExpiry` |
| **FEFO** | First Expiry First Out — sell earliest-expiring batch first | `FEFO` |
| **MRP** | Maximum Retail Price printed on pack, GST-inclusive; never sell above | `mrp` |
| **PTR** | Price To Retailer (wholesaler → retailer), excl. GST | `ptr` |
| **PTS** | Price To Stockist (manufacturer → wholesaler), excl. GST | `pts` |
| **Free quantity / Scheme** | Extra units given free, e.g. "10+1" | `freeQty`, `Scheme` |
| **Trade discount (TD)** | % discount on the line before tax | `tradeDiscountPct` |
| **Cash discount (CD)** | Discount for prompt payment | `cashDiscountPct` |
| **Landed cost** | Effective cost per unit after discounts, free goods and charges | `landedCost` |
| **HSN** | Harmonised System code for goods; determines GST rate | `hsnCode` |
| **GST / CGST / SGST / IGST** | Goods and Services Tax; intra-state split CGST+SGST, inter-state IGST | `GstBreakup` |
| **GSTIN** | 15-char GST registration number; first 2 digits = state code | `gstin` |
| **Place of supply** | State where supply happens; decides CGST+SGST vs IGST | `placeOfSupply` |
| **B2B / B2C** | Sale to a GST-registered business / to a consumer | `SaleType` |
| **E-invoice / IRN** | Invoice registered with the govt portal; returns IRN + QR | `EInvoice` |
| **E-way bill** | Document for moving goods above a value threshold | `EWayBill` |
| **GSTR-1 / 3B / 2B** | GST returns: outward supplies / summary / auto-drafted inward | — |
| **Drug licence (DL)** | Licence to sell drugs (Form 20/21 retail, 20B/21B wholesale) | `drugLicenceNo` |
| **Schedule H** | Prescription-only drugs | `Schedule.H` |
| **Schedule H1** | Stricter Rx drugs (some antibiotics, etc.); sale must be recorded in a register | `Schedule.H1` |
| **Schedule X** | Highly controlled drugs; stricter records and Rx retention | `Schedule.X` |
| **NDPS** | Narcotic Drugs and Psychotropic Substances | `Schedule.NDPS` |
| **OTC** | Over-the-counter, no prescription needed | `Schedule.OTC` |
| **Rx / Prescription** | Doctor's prescription | `Prescription` |
| **Purchase invoice** | Supplier's bill entered into MENO | `PurchaseInvoice` |
| **GRN** | Goods Receipt Note — what physically arrived | `GoodsReceipt` |
| **Sales invoice / Bill** | Our bill to customer | `SalesInvoice` |
| **Held bill** | Unfinished bill parked at the counter | `HeldBill` |
| **Sales return** | Customer returns goods | `SalesReturn` |
| **Purchase return** | We return goods to supplier | `PurchaseReturn` |
| **Expiry / Breakage return** | Returning expired/damaged stock to supplier for credit | `ExpiryReturn` |
| **Credit note / Debit note** | Document reducing / increasing what a party owes | `CreditNote`, `DebitNote` |
| **Inventory movement** | One row recording a stock change (+/−) with its source document | `InventoryMovement` |
| **Stock balance** | Cached current qty per batch per branch, derived from movements | `StockBalance` |
| **Stock transfer** | Moving stock between branches | `StockTransfer` |
| **Stock adjustment** | Authorised correction (damage, theft, count variance) | `StockAdjustment` |
| **Posting** | Making a document final; triggers stock and ledger effects; immutable after | `post()` |
| **Reversal** | Cancelling a posted document by an opposite entry | `reverse()` |
| **Ledger** | Account of all debits/credits for a party or account | `Ledger` |
| **Voucher** | Accounting entry (sales, purchase, receipt, payment, journal) | `Voucher` |
| **Outstanding / Ageing** | Unpaid amount / grouped by how overdue | `Outstanding` |
| **Credit limit / Credit days** | Max unpaid amount / allowed days to pay | `creditLimit`, `creditDays` |
| **Day close** | End-of-day cash count and lock | `DayClose` |
| **Financial year (FY)** | 1 April – 31 March in India | `FinancialYear` |
| **Number series** | Pattern for document numbers per branch/FY/device | `NumberSeries` |
| **Route / Beat** | Wholesale salesman's planned set of retailers to visit | `Route` |
| **Idempotency key** | Client-generated id that makes a retry safe | `Idempotency-Key` |
| **Device** | A registered counter PC running the desktop app | `Device` |
