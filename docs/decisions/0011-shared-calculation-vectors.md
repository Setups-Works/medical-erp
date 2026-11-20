# ADR-0011: Calculation parity through shared test vectors

- Status: Accepted · Date: 2026-11-21

## Decision
GST, pricing, discount, scheme and rounding rules are implemented twice (Java server = truth; TS `billing-engine` for offline and live UI totals). Both must pass every JSON case in `contracts/test-vectors/`. Rule changes start with new vectors approved by Prakalya.

## Consequences
+ Offline bills match server bills. − Two implementations to maintain; CI parity job is mandatory.
