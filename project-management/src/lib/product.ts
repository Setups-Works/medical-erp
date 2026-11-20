"use client";

import useSWR from "swr";
import { api } from "./client";

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
};
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
