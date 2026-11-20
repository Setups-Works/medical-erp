import { z } from "zod";
import { HttpError, assertId, body, route } from "@/lib/api";
import { findMentions, logActivity, notify } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Comment, Task } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  assertId(params.id, "task");
  return toJSON(await Comment.find({ targetType: "task", targetId: params.id }).sort({ createdAt: 1 }).lean());
});

const schema = z.object({ body: z.string().trim().min(1, "Write something first.").max(5000) });

export const POST = route<P>(async (req, { params, session }) => {
  assertId(params.id, "task");
  const { body: text } = await body(req, schema);
  const task = await Task.findById(params.id);
  if (!task) throw new HttpError(404, "That task doesn’t exist.");
  const boardId = String(task.boardId);
  const mentions = await findMentions(text);
  const c = await Comment.create({ targetType: "task", targetId: params.id, boardId, author: session.uid, body: text, mentions });
  task.commentCount = (task.commentCount ?? 0) + 1;
  await task.save();
  const tag = `#${task.number} ${task.title}`;
  await logActivity({ boardId, taskId: params.id, actor: session.uid, action: "commented", detail: `${tag}: ${text.slice(0, 120)}` });
  await notify({ users: mentions, actor: session.uid, type: "mentioned", text: `${session.name} mentioned you on ${tag}`, boardId, taskId: params.id });
  const others = task.assignees.map(String).filter((u) => !mentions.includes(u));
  await notify({ users: others, actor: session.uid, type: "commented", text: `${session.name} commented on ${tag}`, boardId, taskId: params.id });
  publish({ type: "comment.created", boardId, targetType: "task", targetId: params.id, actor: session.uid });
  publish({ type: "task.changed", boardId, taskId: params.id, actor: session.uid });
  return toJSON(c.toObject());
});
