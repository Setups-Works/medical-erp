export type Tint = "blue" | "green" | "amber" | "red" | "violet" | "pink" | "slate";

export type UserT = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  title: string;
  tint: Tint;
  mustChangePassword?: boolean;
  open?: number;
  done?: number;
  total?: number;
  pending?: number;
  active?: number;
  review?: number;
};

export type Column = { key: string; name: string; wipLimit: number };

export type BoardT = {
  id: string;
  key: string;
  name: string;
  description: string;
  kind: "phase" | "backlog" | "custom";
  phase: string;
  columns: Column[];
  total?: number;
  done?: number;
};

export type ChecklistItem = { _id?: string; id?: string; text: string; done: boolean };

export type TaskT = {
  id: string;
  boardId: string;
  column: string;
  order: number;
  rank?: number;
  number: number;
  title: string;
  description: string;
  featureId: string;
  phase: string;
  area: string;
  labels: string[];
  assignees: string[];
  priority: "high" | "medium" | "low";
  size: "S" | "M" | "L" | "";
  dueDate: string | null;
  checklist: ChecklistItem[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentT = { id: string; author: string; body: string; createdAt: string; mentions: string[] };

export type ActivityT = { id: string; boardId?: string; taskId?: string; actor: string; action: string; detail: string; createdAt: string };

export type NotificationT = { id: string; type: string; text: string; boardId?: string; taskId?: string; read: boolean; createdAt: string; actor?: string };
