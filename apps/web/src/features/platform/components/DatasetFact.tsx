/** One label / value pair in a reference list's summary. */
export function DatasetFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-ink-4">{label}</dt>
      <dd className={mono ? "font-mono text-ink tabular-nums" : "text-ink"}>{value}</dd>
    </div>
  );
}
