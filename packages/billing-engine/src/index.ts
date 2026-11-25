/**
 * @meno/billing-engine — TypeScript twin of the Java `taxation` + `pricing` engines (ADR-0011).
 * Formulas: docs/architecture/CALCULATIONS.md. Contract: every case in contracts/test-vectors/** must pass.
 * Inputs and outputs are decimal strings; rates, thresholds and conventions are passed in from tenant settings.
 */
export { Dec, type DecimalString, d, fixed, round } from "./decimal";
export { type CalcOptions, type InvoiceInput, type LineInput, type LineResult, type PriceMode, type SplitRounding, calcInvoice, calcLine, invoiceToStrings } from "./invoice";
export { type TieBreak, allocateBillDiscount, landedCost, largestRemainder, looseSale, margin, suggestedPtr, weightedAverage } from "./pricing";
export { allocatePayment, changeDue, creditCheck, interestCompoundMonthly, interestSimple, tds } from "./accounting";
export { expiryStatus, reorder } from "./inventory";
export { type BillSection, type CombinedLine, combinedBill } from "./combined";
