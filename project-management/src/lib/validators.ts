import { z } from "zod";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

export const taskFields = {
  title: z.string().trim().min(2, "Give the task a title.").max(300),
  description: z.string().max(20000),
  featureId: z.string().max(20),
  phase: z.string().max(4),
  area: z.string().max(40),
  labels: z.array(z.string().trim().min(1).max(40)).max(12),
  assignees: z.array(objectId).max(6),
  priority: z.enum(["high", "medium", "low"]),
  size: z.enum(["S", "M", "L", ""]),
  dueDate: z.string().datetime().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable(),
  checklist: z.array(z.object({ _id: z.string().optional(), text: z.string().trim().min(1).max(300), done: z.boolean() })).max(50),
  column: z.string().min(1),
  order: z.number(),
};

export const createTask = z.object({
  boardId: objectId,
  title: taskFields.title,
  column: taskFields.column.default("backlog"),
  description: taskFields.description.default(""),
  phase: taskFields.phase.default(""),
  featureId: taskFields.featureId.default(""),
  labels: taskFields.labels.default([]),
  assignees: taskFields.assignees.default([]),
  priority: taskFields.priority.default("medium"),
  size: taskFields.size.default(""),
  dueDate: taskFields.dueDate.optional(),
});

export const updateTask = z.object(taskFields).partial().extend({ archived: z.boolean().optional() });
