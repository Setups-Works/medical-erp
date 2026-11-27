"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { api } from "./client";
import type { TaskT } from "./types";

export type MapFeature = { id: string; taskId: string | null; boardId: string | null; column: string; number: number | null; priority: string | null; phase: string; assignees: string[] };
export type MapItem = {
  id: string;
  kind: "menu" | "capability" | "page" | "role" | "feature";
  group: string;
  name: string;
  route: string;
  edition: string;
  notes: string;
  meta: Record<string, string | boolean>;
  features: MapFeature[];
  done: number;
  started: number;
  total: number;
  phase: string;
  checked?: boolean;
  checkedBy?: string | null;
  checkedAt?: string | null;
  stages?: Record<PageStage, StageTick>;
  tasks?: Record<"be" | "fe", PageTask | null>;
};
export type PageTask = { taskId: string; number: number; boardId: string; column: string; assignee: string | null };
export type PageStage = "be" | "fe" | "qa";
export type StageTick = { done: boolean; by: string | null; at: string | null };
export type ProductMap = { menu: MapItem[]; capabilities: MapItem[]; pages: MapItem[]; roles: MapItem[]; features: MapItem[] };

export const useProductMap = () => useSWR<ProductMap>("/api/product-map", (u: string) => api<ProductMap>(u));

export const COLUMN_LABEL: Record<string, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  review: "In review",
  qa: "QA",
  done: "Done",
  missing: "No task",
};
export const COLUMN_TINT: Record<string, "slate" | "blue" | "amber" | "violet" | "green" | "red"> = {
  backlog: "slate",
  todo: "slate",
  in_progress: "amber",
  review: "violet",
  qa: "blue",
  done: "green",
  missing: "red",
};

export type TaskPage = { name: string; route: string; group: string };
export type TaskLinks = { features: { id: string; name: string }[]; pages: TaskPage[] };

const FEATURE_ID = /\b[A-Z]{3}-\d{2}\b/g;
type Index = { featureName: Map<string, string>; pagesByFeature: Map<string, TaskPage[]> };
// One index per product-map response, shared by every card on the board.
const indexCache = new WeakMap<ProductMap, Index>();

function indexOf(map: ProductMap): Index {
  const hit = indexCache.get(map);
  if (hit) return hit;
  const featureName = new Map(map.features.map((f) => [f.features[0]?.id ?? "", f.name] as [string, string]));
  const pagesByFeature = new Map<string, TaskPage[]>();
  for (const p of map.pages) {
    for (const f of p.features) pagesByFeature.set(f.id, [...(pagesByFeature.get(f.id) ?? []), { name: p.name, route: p.route, group: p.group }]);
  }
  const idx = { featureName, pagesByFeature };
  indexCache.set(map, idx);
  return idx;
}

/**
 * Feature IDs a task delivers: its own feature, IDs named in its title, or (QA tasks) the "### Features" list.
 * Member-plan descriptions also mention IDs, but only as phase context, so they are not counted.
 */
export function taskFeatureIds(task: Pick<TaskT, "featureId" | "title" | "description">): string[] {
  const ids = new Set<string>();
  if (task.featureId) ids.add(task.featureId);
  for (const m of task.title.match(FEATURE_ID) ?? []) ids.add(m);
  const qa = task.description.split("### Features")[1]?.split("\n### ")[0];
  for (const m of qa?.match(FEATURE_ID) ?? []) ids.add(m);
  return [...ids];
}

/** The features and pages (docs/product/PAGES.md) a task builds or tests, for the badges on cards and the dialog. */
export function useTaskLinks(task: Pick<TaskT, "featureId" | "title" | "description"> | undefined): TaskLinks {
  const { data } = useProductMap();
  return useMemo(() => {
    if (!task) return { features: [], pages: [] };
    const ids = taskFeatureIds(task);
    const idx = data ? indexOf(data) : null;
    const seen = new Set<string>();
    const pages: TaskPage[] = [];
    for (const id of ids) {
      for (const p of idx?.pagesByFeature.get(id) ?? []) {
        if (seen.has(p.route)) continue;
        seen.add(p.route);
        pages.push(p);
      }
    }
    return { features: ids.map((id) => ({ id, name: idx?.featureName.get(id) ?? "" })), pages };
  }, [data, task]);
}
