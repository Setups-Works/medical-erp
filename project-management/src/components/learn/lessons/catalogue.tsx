"use client";

import Link from "next/link";
import { useMemo } from "react";
import { COLUMN_LABEL, type MapItem, useProductMap } from "@/lib/product";
import { Skeleton } from "../../ui";
import { B, Callout, Section, Table } from "../kit";

const EDITION: Record<string, string> = { R: "Retail", W: "Wholesale", B: "Both" };

function group<T>(xs: T[], key: (x: T) => string) {
  const out = new Map<string, T[]>();
  for (const x of xs) out.set(key(x), [...(out.get(key(x)) ?? []), x]);
  return [...out.entries()];
}

/** Live from the Hub's product map (imported from FEATURES.md and PAGES.md). */
export function FeatureCatalogue() {
  const { data } = useProductMap();
  const features = useMemo(() => group(data?.features ?? [], (f: MapItem) => f.group), [data]);
  const pages = useMemo(() => group(data?.pages ?? [], (p: MapItem) => p.group), [data]);
  if (!data) return <Skeleton className="h-64" />;
  const done = data.features.filter((f) => f.features[0]?.column === "done").length;
  return (
    <>
      <Section title="How to read the catalogue">
        <p>
          Every feature has an ID like <B>POS-03</B>: a 3-letter area and a number. IDs appear in tasks, branches, commits and PRs. Every page (screen) lists the feature IDs it builds. There are{" "}
          <B>{data.features.length} features</B> and <B>{data.pages.length} pages</B>; {done} features are done.
        </p>
        <Callout tone="teach">
          Give each developer one area per day: they read its features here, open its pages on the <Link href="/pages" className="underline">Pages</Link> list, and explain one to the class.
        </Callout>
      </Section>

      <Section title="Features by area">
        <Table
          head={["Area", "Features", "Must-have", "Done"]}
          rows={features.map(([g, fs]) => [g, String(fs.length), String(fs.filter((f) => f.meta.priority === "M").length), String(fs.filter((f) => f.features[0]?.column === "done").length)])}
        />
      </Section>

      {features.map(([g, fs]) => (
        <Section key={g} title={g}>
          <Table
            compact
            head={["ID", "Feature", "Edition", "Phase", "Status"]}
            mono={[0, 3]}
            rows={fs.map((f) => [
              <Link key="id" href={`/features?q=${encodeURIComponent(f.features[0]?.id ?? "")}`} className="hover:underline">
                {f.features[0]?.id}
              </Link>,
              f.name,
              EDITION[f.edition] ?? f.edition,
              String(f.meta.phase ?? ""),
              COLUMN_LABEL[f.features[0]?.column ?? "missing"] ?? "",
            ])}
          />
        </Section>
      ))}

      <Section title="Pages by section">
        <Table
          compact
          head={["Section", "Page", "Route", "Phase", "Features"]}
          mono={[2, 4]}
          rows={pages.flatMap(([g, ps]) =>
            ps.map((p, i) => [i === 0 ? <B key="g">{g}</B> : "", p.name, p.route, String(p.meta.phase ?? ""), p.features.map((f) => f.id).join(", ")]),
          )}
        />
      </Section>
    </>
  );
}
