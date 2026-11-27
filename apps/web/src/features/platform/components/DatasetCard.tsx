"use client";

import { useState } from "react";
import type { ReferenceDataset, ReferenceLoad } from "@meno/api-client";
import { Badge, Button, Callout, Card, Icon, formatDate } from "@meno/ui";
import { cadence, count, statusOf } from "../utils";
import { DatasetFact as Fact } from "./DatasetFact";
import { LoadFileForm } from "./LoadFileForm";
import { LoadHistory } from "./LoadHistory";

/** One list: what it is, where it comes from, what is loaded and when it is due. Load and history open inline. */
export function DatasetCard({ dataset: d, canLoad }: { dataset: ReferenceDataset; canLoad: boolean }) {
  const [open, setOpen] = useState<"load" | "history" | null>(null);
  const [loaded, setLoaded] = useState<ReferenceLoad | null>(null);
  const status = statusOf(d.status);
  const later = d.status === "LATER";
  const code = d.code ?? "";

  return (
    <Card className="flex flex-col gap-4" data-testid={`dataset-${code}`}>
      <div className="flex flex-col gap-x-3 gap-y-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
            {d.name}
            <Badge tint={status.tint}>{later ? `${status.label} · ${d.phase}` : status.label}</Badge>
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-3">{d.description}</p>
        </div>
        {!later && (
          <div className="flex gap-1 max-sm:-ml-2.5">
            <Button variant="ghost" size="sm" onClick={() => {
                setLoaded(null);
                setOpen(open === "history" ? null : "history");
              }} aria-expanded={open === "history"} data-testid={`history-${code}`}>
              History
            </Button>
            {canLoad && (
              <Button variant="outline" size="sm" onClick={() => {
                  setLoaded(null);
                  setOpen(open === "load" ? null : "load");
                }} aria-expanded={open === "load"} data-testid={`load-${code}`}>
                <Icon name="upload" />
                Load new file
              </Button>
            )}
          </div>
        )}
      </div>

      {later ? (
        <p className="text-[13px] text-ink-3">
          Loaded with the {d.ownerModule} module in {d.phase}. Source: {d.sourceName}.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:grid-cols-4">
          <Fact label="Rows" value={d.loadedAt ? count(d.rowCount) : "—"} mono />
          <Fact label="File dated" value={d.sourceDate ? formatDate(d.sourceDate) : "—"} />
          <Fact label="Loaded" value={d.loadedAt ? `${formatDate(d.loadedAt)}${d.loadedByName ? ` · ${d.loadedByName}` : ""}` : "Never"} />
          <Fact label="Next refresh" value={d.dueOn ? `${formatDate(d.dueOn)} · ${cadence(d.refreshMonths).toLowerCase()}` : cadence(d.refreshMonths)} />
        </dl>
      )}

      {!later && d.onlineLookup && (
        <div data-testid={`online-${code}`}>
          <Callout tone="info">
            {d.loadedAt ? "PIN codes missing from this list" : "Until a file is loaded, PIN codes"} are looked up online in India Post’s directory (api.postalpincode.in), so address forms still fill the state and district. The desktop app works offline only with a loaded list.
          </Callout>
        </div>
      )}

      {!later && (
        <p className="text-[12.5px] text-ink-3">
          Source:{" "}
          {d.sourceUrl ? (
            <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink-2 underline underline-offset-2 hover:text-ink">
              {d.sourceName}
            </a>
          ) : (
            d.sourceName
          )}{" "}
          · {d.licence}
          {d.attribution && <span className="block text-ink-4">{d.attribution}</span>}
        </p>
      )}

      {loaded && open === "history" && (
        <div data-testid={`loaded-${code}`}>
          <Callout tone="success">
            Loaded {count(loaded.rowsLoaded)} rows from {loaded.fileName}.
            {loaded.rowsSkipped ? ` Skipped ${count(loaded.rowsSkipped)} rows; the reasons are in the history below.` : ""}
          </Callout>
        </div>
      )}
      {open === "load" && canLoad && (
        <LoadFileForm
          dataset={d}
          onDone={(result) => {
            setLoaded(result);
            setOpen("history");
          }}
          onCancel={() => setOpen(null)}
        />
      )}
      {open === "history" && <LoadHistory code={code} />}
    </Card>
  );
}

