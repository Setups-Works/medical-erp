"use client";

import { Badge, Button, Callout, Skeleton, formatDate } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useReferenceLoads } from "../queries";
import { REASONS, count, fileSize } from "../utils";

/** Last 20 attempts for one list, newest first: loaded and refused files, who loaded them and what was skipped. */
export function LoadHistory({ code }: { code: string }) {
  const loads = useReferenceLoads(code, true);
  const items = loads.data?.items ?? [];

  if (loads.isPending) return <Skeleton className="h-24" />;
  if (loads.isError) {
    return (
      <Callout tone="critical" action={<Button variant="outline" size="sm" onClick={() => loads.refetch()}>Try again</Button>}>
        {problemMessage(loads.error, "Couldn't load the history.")}
      </Callout>
    );
  }
  if (items.length === 0) return <p className="border-t border-line pt-4 text-[13px] text-ink-3">No files loaded yet.</p>;

  return (
    <ol className="flex flex-col divide-y divide-line border-t border-line" data-testid={`history-list-${code}`}>
      {items.map((l) => {
        const reasons = Object.entries(l.skippedByReason ?? {});
        return (
          <li key={l.id} className="flex flex-col gap-1 py-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Badge tint={l.status === "LOADED" ? "green" : "red"}>{l.status === "LOADED" ? "Loaded" : "Refused"}</Badge>
              <span className="min-w-0 truncate font-medium text-ink">{l.fileName}</span>
              <span className="text-ink-4">{fileSize(l.fileBytes)}</span>
              <span className="ml-auto text-ink-3">
                {formatDate(l.startedAt)}
                {l.loadedByName ? ` · ${l.loadedByName}` : ""}
              </span>
            </div>
            <p className="text-ink-3">
              {l.status === "LOADED"
                ? `${count(l.rowsLoaded)} rows loaded from ${count(l.rowsRead)} read${l.rowsSkipped ? `, ${count(l.rowsSkipped)} skipped` : ""}${l.replacedAnyway ? " · replaced anyway" : ""}.`
                : `${REASONS[l.reasonCode ?? ""] ?? "Refused"}. Nothing changed.`}{" "}
              File dated {formatDate(l.sourceDate)}.
            </p>
            {reasons.length > 0 && (
              <details className="text-ink-3">
                <summary className="w-fit cursor-pointer text-[12.5px] text-ink-2 hover:text-ink">Skipped rows</summary>
                <ul className="mt-1 flex flex-col gap-0.5 text-[12.5px]">
                  {reasons.map(([reason, n]) => (
                    <li key={reason}>
                      <span className="font-mono tabular-nums">{count(n)}</span> × {reason}
                    </li>
                  ))}
                </ul>
                {(l.problems?.length ?? 0) > 0 && (
                  <ul className="mt-2 flex flex-col gap-0.5 font-mono text-[12px] text-ink-4">
                    {l.problems!.slice(0, 10).map((p) => (
                      <li key={`${p.line}-${p.reason}`}>
                        Line {p.line}: {p.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
