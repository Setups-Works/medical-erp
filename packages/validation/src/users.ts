/**
 * User management (/admin/users, PLT-06). Mirrors UserAccessRequest in meno-api UserAdminController: at least one
 * role, and 1–50 branches unless one of the chosen roles covers every branch. Which roles do that comes from the API
 * (GET /admin/users/options → roles[].allBranches), never from code.
 */
import { z } from "zod";

export function userAccess({ allBranchRoles }: { allBranchRoles: readonly string[] }) {
  return z
    .object({
      roleCodes: z.array(z.string().min(1)).min(1, "Choose at least one role.").max(20, "Choose up to 20 roles."),
      branchIds: z.array(z.string().uuid()).max(50, "Choose up to 50 branches."),
    })
    .superRefine((v, ctx) => {
      const coversAll = v.roleCodes.some((r) => allBranchRoles.includes(r));
      if (!coversAll && v.branchIds.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["branchIds"], message: "Choose at least one branch." });
      }
    });
}
export type UserAccess = z.infer<ReturnType<typeof userAccess>>;
