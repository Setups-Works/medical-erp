import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    title: { type: String, default: "" },
    tint: { type: String, default: "slate" },
    mustChangePassword: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const columnSchema = new Schema({ key: String, name: String, wipLimit: { type: Number, default: 0 } }, { _id: false });

const boardSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    kind: { type: String, enum: ["phase", "backlog", "custom"], default: "custom" },
    phase: { type: String, default: "" },
    columns: { type: [columnSchema], default: [] },
    order: { type: Number, default: 100 },
    archived: { type: Boolean, default: false },
    createdBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const checklistSchema = new Schema({ text: String, done: { type: Boolean, default: false } });

const taskSchema = new Schema(
  {
    boardId: { type: ObjectId, ref: "Board", required: true, index: true },
    column: { type: String, required: true },
    order: { type: Number, default: 0 },
    // Suggested work order across the whole plan (set by the seed from the docs); 0 = added by hand
    rank: { type: Number, default: 0 },
    number: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    featureId: { type: String, default: "" },
    phase: { type: String, default: "" },
    area: { type: String, default: "" },
    labels: { type: [String], default: [] },
    assignees: [{ type: ObjectId, ref: "User" }],
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    size: { type: String, enum: ["S", "M", "L", ""], default: "" },
    dueDate: { type: Date, default: null },
    checklist: { type: [checklistSchema], default: [] },
    commentCount: { type: Number, default: 0 },
    sourceKey: { type: String, index: true },
    // true while description/checklist are still the generated ones; edits by people set it to false
    autoContent: { type: Boolean, default: false },
    // true while assignees follow docs/team/OWNERSHIP_MATRIX.md; reassigning by hand sets it to false
    autoAssign: { type: Boolean, default: false },
    createdBy: { type: ObjectId, ref: "User" },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
taskSchema.index({ boardId: 1, column: 1, order: 1 });
taskSchema.index({ assignees: 1, column: 1 });
taskSchema.index({ title: "text", description: "text", featureId: "text" });

const commentSchema = new Schema(
  {
    targetType: { type: String, enum: ["task", "board"], required: true },
    targetId: { type: ObjectId, required: true, index: true },
    boardId: { type: ObjectId, ref: "Board", index: true },
    author: { type: ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 5000 },
    mentions: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

const activitySchema = new Schema(
  {
    boardId: { type: ObjectId, ref: "Board", index: true },
    taskId: { type: ObjectId, ref: "Task", index: true },
    actor: { type: ObjectId, ref: "User" },
    action: { type: String, required: true },
    detail: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const notificationSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    actor: { type: ObjectId, ref: "User" },
    type: { type: String, enum: ["assigned", "mentioned", "commented", "review"], required: true },
    text: { type: String, required: true },
    boardId: { type: ObjectId, ref: "Board" },
    taskId: { type: ObjectId, ref: "Task" },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/** Product map: the MENO sidebar (docs/design/NAVIGATION.md) and capability list (docs/product/COVERAGE.md). */
const productItemSchema = new Schema({
  kind: { type: String, enum: ["menu", "capability", "page", "role", "feature"], required: true },
  group: { type: String, default: "" },
  name: { type: String, required: true },
  route: { type: String, default: "" },
  edition: { type: String, default: "B" },
  featureIds: { type: [String], default: [] },
  notes: { type: String, default: "" },
  meta: { type: Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
});
productItemSchema.index({ kind: 1, order: 1 });

/** One delivery tick on a page (backend endpoints ready, frontend ready, QA passed): who ticked it and when. */
const pageStageSchema = new Schema({ done: { type: Boolean, default: false }, by: { type: ObjectId, ref: "User" }, at: Date }, { _id: false });

/**
 * Manual ticks from the Pages list; survives re-imports (keyed by section + page name).
 * `done` is the final "built, tested and accepted"; be / fe / qa track the steps towards it.
 */
const pageCheckSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    done: { type: Boolean, default: false },
    by: { type: ObjectId, ref: "User" },
    doneAt: Date, // own timestamp: updatedAt also moves when a BE / FE / QA tick changes
    be: { type: pageStageSchema, default: () => ({}) },
    fe: { type: pageStageSchema, default: () => ({}) },
    qa: { type: pageStageSchema, default: () => ({}) },
    // The page's own Backend / Frontend work cards (created from the Pages list)
    beTask: { type: ObjectId, ref: "Task", default: null },
    feTask: { type: ObjectId, ref: "Task", default: null },
  },
  { timestamps: true },
);

/** One-time password reset link. Only the SHA-256 of the token is stored; Mongo's TTL index removes expired rows. */
const passwordResetSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });

function model<S extends Schema>(name: string, schema: S): Model<InferSchemaType<S>> {
  return (mongoose.models[name] as Model<InferSchemaType<S>>) ?? mongoose.model(name, schema);
}

export const User = model("User", userSchema);
export const Board = model("Board", boardSchema);
export const Task = model("Task", taskSchema);
export const Comment = model("Comment", commentSchema);
export const Activity = model("Activity", activitySchema);
export const Notification = model("Notification", notificationSchema);
export const Counter = model("Counter", counterSchema);
export const ProductItem = model("ProductItem", productItemSchema);
export const PageCheck = model("PageCheck", pageCheckSchema);
export const PasswordReset = model("PasswordReset", passwordResetSchema);

export async function nextTaskNumber(): Promise<number> {
  const c = await Counter.findByIdAndUpdate("task", { $inc: { seq: 1 } }, { upsert: true, new: true }).lean();
  return c!.seq;
}

export const DEFAULT_COLUMNS = [
  { key: "backlog", name: "Backlog", wipLimit: 0 },
  { key: "todo", name: "To do", wipLimit: 0 },
  { key: "in_progress", name: "In progress", wipLimit: 6 },
  { key: "review", name: "In review", wipLimit: 6 },
  { key: "qa", name: "QA", wipLimit: 6 },
  { key: "done", name: "Done", wipLimit: 0 },
];

export const PHASES = [
  { key: "P0", name: "Foundation" },
  { key: "P1", name: "Platform core" },
  { key: "P2", name: "Masters" },
  { key: "P3", name: "Purchase & inventory" },
  { key: "P4", name: "Retail POS & returns" },
  { key: "P5", name: "Wholesale, finance, offline" },
  { key: "P6", name: "Pilot & GST returns" },
  { key: "P7", name: "Growth" },
];
