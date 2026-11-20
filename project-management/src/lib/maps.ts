"use client";

import { useMemo } from "react";
import { useBoards, useUsers } from "./client";
import type { BoardT, UserT } from "./types";

export function useLookups() {
  const { data: users } = useUsers();
  const { data: boards } = useBoards();
  const userMap = useMemo(() => new Map((users ?? []).map((u) => [u.id, u] as [string, UserT])), [users]);
  const boardMap = useMemo(() => new Map((boards ?? []).map((b) => [b.id, b] as [string, BoardT])), [boards]);
  return { users, boards, userMap, boardMap };
}
