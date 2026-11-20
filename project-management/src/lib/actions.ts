import { Activity, Notification, User } from "./models";
import { publish } from "./events";

export async function logActivity(a: { boardId?: string; taskId?: string; actor: string; action: string; detail?: string }) {
  await Activity.create(a);
}

export async function notify(n: {
  users: string[];
  actor: string;
  type: "assigned" | "mentioned" | "commented";
  text: string;
  boardId?: string;
  taskId?: string;
}) {
  const targets = [...new Set(n.users.map(String))].filter((u) => u !== n.actor);
  if (!targets.length) return;
  await Notification.insertMany(targets.map((user) => ({ user, actor: n.actor, type: n.type, text: n.text, boardId: n.boardId, taskId: n.taskId })));
  for (const userId of targets) publish({ type: "notification", userId });
}

/** Finds @mentions by first name (case-insensitive), e.g. "@kamesh can you check?" */
export async function findMentions(body: string): Promise<string[]> {
  const names = [...body.matchAll(/@([a-z][a-z0-9_-]{1,30})/gi)].map((m) => m[1].toLowerCase());
  if (!names.length) return [];
  const users = await User.find({ active: true }).select("name").lean();
  return users.filter((u) => names.includes(u.name.split(" ")[0].toLowerCase())).map((u) => String(u._id));
}
