"use client";

import { useEffect, useRef, useState } from "react";
import type { TeamInvitation } from "@meno/api-client";
import { Badge, Button, formatDate, Icon, type Tint } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useInvitationAction } from "../queries";

/** Status is always written out, never colour alone (DESIGN_LANGUAGE §4 status colours). */
const STATUS: Record<NonNullable<TeamInvitation["status"]>, { label: string; tint: Tint }> = {
  PENDING: { label: "Invited", tint: "slate" },
  EXPIRED: { label: "Link expired", tint: "red" },
  ACCEPTED: { label: "Joined", tint: "green" },
  REVOKED: { label: "Revoked", tint: "slate" },
};

/** One invitation with resend / revoke (revoke asks once more inline). Used by /onboarding/team and /admin/users. */
export function InvitationRow({ invitation: i, canManage = true }: { invitation: TeamInvitation; canManage?: boolean }) {
  const resend = useInvitationAction("resend");
  const revoke = useInvitationAction("revoke");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const revokeRef = useRef<HTMLButtonElement>(null);
  const toggled = useRef(false);
  const status = STATUS[i.status ?? "PENDING"];
  const open = i.status === "PENDING" || i.status === "EXPIRED";
  const error = resend.error ?? revoke.error;

  // The button pressed unmounts when the inline confirm swaps in or out, which would drop keyboard
  // focus to <body>. Land on the safe choice ("Keep") when asking, and back on "Revoke" when cancelled.
  useEffect(() => {
    if (!toggled.current) return;
    (confirmRevoke ? keepRef : revokeRef).current?.focus();
  }, [confirmRevoke]);

  function askRevoke(next: boolean) {
    toggled.current = true;
    setConfirmRevoke(next);
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <Icon name="users" className="hidden text-ink-3 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-ink">
          {i.fullName}
          <span className="text-[12.5px] font-normal text-ink-3">{i.roleLabel}</span>
          <Badge tint={status.tint}>{status.label}</Badge>
        </p>
        <p className="truncate text-[12.5px] text-ink-3">
          {[i.email, i.mobile].filter(Boolean).join(" · ")}
          {i.branches?.length ? ` · ${i.branches.map((b) => b.name).join(", ")}` : ""}
        </p>
        {i.status === "PENDING" && <p className="text-[12px] text-ink-4">Link works until {formatDate(i.expiresAt)}</p>}
        {error && <p className="text-[12.5px] text-critical">{problemMessage(error, "Couldn't update the invitation.")}</p>}
      </div>
      {open && canManage && (
        <div
          className="flex items-center gap-1"
          onKeyDown={(e) => {
            if (confirmRevoke && e.key === "Escape") {
              e.stopPropagation();
              askRevoke(false);
            }
          }}
        >
          {confirmRevoke ? (
            <>
              <Button ref={keepRef} variant="ghost" size="sm" onClick={() => askRevoke(false)}>
                Keep
              </Button>
              <Button variant="outline" size="sm" loading={revoke.isPending} onClick={() => revoke.mutate(i.id ?? "")} aria-label={`Confirm revoking ${i.fullName}'s invitation`}>
                Revoke link
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" loading={resend.isPending} onClick={() => resend.mutate(i.id ?? "")} aria-label={`Resend ${i.fullName}'s invitation`}>
                Resend
              </Button>
              <Button ref={revokeRef} variant="ghost" size="sm" onClick={() => askRevoke(true)} aria-label={`Revoke ${i.fullName}'s invitation`}>
                Revoke
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
