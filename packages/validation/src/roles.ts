/**
 * Role management (/admin/roles, PLT-07). Mirrors NewRoleRequest / RenameRoleRequest in meno-api
 * RoleAdminController: a name of 1–60 characters and an optional description up to 300, no control characters.
 * Whether a name is free is the API's answer (IDENTITY_ROLE_NAME_TAKEN).
 */
import { z } from "zod";

// eslint-disable-next-line no-control-regex
const noControl = /^[^\u0000-\u001f\u007f]*$/;

export const roleForm = z.object({
  label: z.string().trim().min(1, "Enter a name for the role.").max(60, "Use up to 60 characters.").regex(noControl, "Remove special characters."),
  description: z.string().trim().max(300, "Use up to 300 characters.").regex(noControl, "Remove special characters."),
});
export type RoleForm = z.infer<typeof roleForm>;
