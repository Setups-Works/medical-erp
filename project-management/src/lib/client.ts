"use client";

import useSWR, { mutate } from "swr";
import type { ActivityT, BoardT, NotificationT, TaskT, UserT } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 401 && typeof window !== "undefined" && !url.includes("/auth/login")) window.location.href = "/login";
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong.");
  return data as T;
}

const fetcher = <T,>(url: string) => api<T>(url);

export const useMe = () => useSWR<UserT>("/api/auth/me", fetcher);
export const useUsers = () => useSWR<UserT[]>("/api/users", fetcher);
export const useBoards = () => useSWR<(BoardT & { total: number; done: number })[]>("/api/boards", fetcher);
export const useBoard = (id: string) => useSWR<{ board: BoardT; tasks: TaskT[] }>(id ? `/api/boards/${id}` : null, fetcher);
export const useTasks = (query: string) => useSWR<TaskT[]>(`/api/tasks?${query}`, fetcher);
export const useTask = (id: string | null) => useSWR<TaskT>(id ? `/api/tasks/${id}` : null, fetcher);
export const useActivity = (query = "") => useSWR<ActivityT[]>(`/api/activity?${query}`, fetcher);
export const useNotifications = () => useSWR<{ items: NotificationT[]; unread: number }>("/api/notifications", fetcher);
export const useStats = () =>
  useSWR<{
    phases: { key: string; name: string; total: number; done: number; features: number; featuresDone: number }[];
    columns: Record<string, number>;
    overall: { total: number; done: number; open: number };
    mine: Record<string, number>;
  }>("/api/stats", fetcher);

/** Revalidates every cached request whose URL starts with one of the prefixes. */
export function refresh(...prefixes: string[]) {
  return mutate((key) => typeof key === "string" && prefixes.some((p) => key.startsWith(p)));
}
