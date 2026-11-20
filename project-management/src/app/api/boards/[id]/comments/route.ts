import { z } from "zod";
import { HttpError, assertId, body, route } from "@/lib/api";
import { findMentions, logActivity, notify } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Board, Comment } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  assertId(params.id, "board");
  const comments = await Comment.find({ targetType: "board", targetId: params.id }).sort({ createdAt: 1 }).lean();
  return toJSON(comments);
});

const schema = z.object({ body: z.string().trim().min(1, "Write something first.").max(5000) });

export const POST = route<P>(async (req, { params, session }) => {
  assertId(params.id, "board");
  const { body: text } = await body(req, schema);
  const board = await Board.findById(params.id).lean();
  if (!board) throw new HttpError(404, "That board doesn’t exist.");
  const mentions = await findMentions(text);
  const c = await Comment.create({ targetType: "board", targetId: params.id, boardId: params.id, author: session.uid, body: text, mentions });
  await logActivity({ boardId: params.id, actor: session.uid, action: "commented on board", detail: text.slice(0, 120) });
  await notify({ users: mentions, actor: session.uid, type: "mentioned", text: `${session.name} mentioned you on ${board.name}`, boardId: params.id });
  publish({ type: "comment.created", boardId: params.id, targetType: "board", targetId: params.id, actor: session.uid });
  return toJSON(c.toObject());
});
