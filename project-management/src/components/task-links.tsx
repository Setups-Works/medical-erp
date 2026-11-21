"use client";

import { Files, ListChecks } from "lucide-react";
import Link from "next/link";
import type { TaskLinks } from "@/lib/product";
import { Inline } from "./inline";
import { Badge } from "./ui";

/** Compact row for task cards: feature IDs, then page names (first two, rest counted). Not links: the card itself is clickable. */
export function TaskLinkBadges({ links, maxPages = 2 }: { links: TaskLinks; maxPages?: number }) {
  if (!links.features.length && !links.pages.length) return null;
  const extra = links.pages.length - maxPages;
  return (
    <div className="mt-2 flex flex-wrap gap-1" data-testid="task-links">
      {links.features.slice(0, 3).map((f) => (
        <Badge key={f.id} tint="blue" className="font-mono">
          <span title={f.name ? `Feature ${f.id}: ${f.name}` : `Feature ${f.id}`} className="inline-flex items-center gap-1">
            <ListChecks className="size-3" />
            {f.id}
          </span>
        </Badge>
      ))}
      {links.features.length > 3 && <Badge>+{links.features.length - 3}</Badge>}
      {links.pages.slice(0, maxPages).map((p) => (
        <Badge key={p.route} tint="violet">
          <span title={`Page ${p.route}`} className="inline-flex items-center gap-1">
            <Files className="size-3" />
            {p.name}
          </span>
        </Badge>
      ))}
      {extra > 0 && <Badge tint="violet">+{extra} page{extra > 1 ? "s" : ""}</Badge>}
    </div>
  );
}

/** Full block for the task dialog: what this task builds, with links to the Features and Pages lists. */
export function TaskLinkPanel({ links }: { links: TaskLinks }) {
  if (!links.features.length && !links.pages.length)
    return (
      <p className="flex items-center gap-1.5 text-[12.5px] text-ink-4" data-testid="task-link-panel">
        <ListChecks className="size-3.5" />
        Not tied to one feature or page: setup, platform or cross-cutting work.
      </p>
    );
  return (
    <div className="space-y-3 rounded-ctl bg-side px-4 py-3" data-testid="task-link-panel">
      {links.features.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
            <ListChecks className="size-3.5" />
            {links.features.length > 1 ? `Features (${links.features.length})` : "Feature"}
          </p>
          <ul className="space-y-1">
            {links.features.map((f) => (
              <li key={f.id} className="flex items-baseline gap-2 text-[13px]">
                <Link href={`/features?q=${encodeURIComponent(f.id)}`} className="shrink-0">
                  <Badge tint="blue" className="font-mono hover:underline">
                    {f.id}
                  </Badge>
                </Link>
                <span className="min-w-0 text-ink-2">{f.name ? <Inline text={f.name} /> : <span className="text-ink-4">Not in FEATURES.md</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
          <Files className="size-3.5" />
          {links.pages.length ? `Pages (${links.pages.length})` : "Pages"}
        </p>
        {links.pages.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {links.pages.map((p) => (
              <li key={p.route}>
                <Link href={`/pages?q=${encodeURIComponent(p.route)}`} title={p.group}>
                  <Badge tint="violet" className="hover:underline">
                    {p.name}
                    <span className="font-mono font-normal opacity-70">{p.route}</span>
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-ink-4">No screen: backend, infrastructure or cross-cutting work.</p>
        )}
      </div>
    </div>
  );
}
