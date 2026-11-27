/**
 * Team step (AUT-09, ONBOARDING.md step 9). Mirrors TeamInvitationRequest in meno-api TeamController:
 * fullName 1–100, email or 10-digit mobile (at least one), a role code and 1–50 branch ids from GET /team/options.
 * Whether SMS can carry the link comes from the API (options.smsAvailable), never from code.
 */
import { z } from "zod";
import { email, indianMobile, optional, optionValue, personName } from "./fields";

export function teamInvite({ smsAvailable }: { smsAvailable: boolean }) {
  return z
    .object({
      fullName: personName,
      email: optional(email),
      mobile: optional(indianMobile),
      roleCode: optionValue("Choose a role."),
      branchIds: z.array(z.string().uuid()).min(1, "Choose at least one branch.").max(50, "Choose up to 50 branches."),
    })
    .superRefine((v, ctx) => {
      if (!v.email && !v.mobile) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Enter an email address or a mobile number." });
      } else if (!v.email && !smsAvailable) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "SMS isn't set up yet. Add an email address to send the invitation." });
      }
    });
}
export type TeamInvite = z.infer<ReturnType<typeof teamInvite>>;
export type TeamInviteForm = z.input<ReturnType<typeof teamInvite>>;
