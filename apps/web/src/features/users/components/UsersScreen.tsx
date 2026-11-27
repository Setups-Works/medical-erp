"use client";

import { useEffect, useRef, useState } from "react";
import type { StaffUser } from "@meno/api-client";
import { Badge, Button, Callout, EmptyState, formatDate, Icon, Input, Kbd, PageHeader, Segmented, Skeleton, cn } from "@meno/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { problemMessage } from "@/lib/problem";
import { useInvitations, useStaffUsers, useTeamOptions, useUserOptions, type UserStatusFilter } from "../queries";
import { branchSummary, userStatus } from "../utils";
import { InvitationRow } from "./InvitationRow";
import { InviteForm } from "./InviteForm";
import { UserPanel } from "./UserPanel";

const STATUS_FILTERS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Deactivated" },
  { value: "ALL", label: "All" },
] as const;

/**
 * /admin/users (PLT-06): staff accounts with their roles and branches, and the open invitations. Keyboard: "/" puts
 * the cursor in search, Esc closes the open person. What is shown follows the person's permissions; the API checks
 * every call again.
 */
export function UsersScreen() {
  const permissions = usePermissions();
  const canManage = permissions.has("identity.user.manage");
  const canSeeInvites = permissions.has("identity.invitation.view");
  const canInvite = permissions.has("identity.invitation.manage");
  const [tab, setTab] = useState<"people" | "invitations">("people");
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const [status, setStatus] = useState<UserStatusFilter>("ACTIVE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const users = useStaffUsers(q, status);
  const options = useUserOptions();
  const invitations = useInvitations(canSeeInvites);
  const teamOptions = useTeamOptions(canInvite);
  const list = users.data?.items ?? [];
  const selected = list.find((u) => u.id === selectedId) ?? null;
  const openInvites = (invitations.data?.items ?? []).filter((i) => i.status === "PENDING" || i.status === "EXPIRED").length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setTab("people");
        searchRef.current?.focus();
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startInvite = () => {
    setTab("invitations");
    setInviting(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Everyone who can sign in to your pharmacy, what their role lets them do, and the branches they work at."
        actions={
          canInvite && (
            <Button onClick={startInvite} data-testid="invite-open">
              <Icon name="user-plus" />
              Invite person
            </Button>
          )
        }
        className="mb-0"
      />

      {canSeeInvites && (
        <Segmented
          aria-label="Show"
          className="self-start"
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          options={[
            { value: "people", label: `People${users.data ? ` · ${users.data.totalItems}` : ""}` },
            { value: "invitations", label: `Invitations${openInvites ? ` · ${openInvites} open` : ""}` },
          ]}
        />
      )}

      {tab === "people" ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex items-center sm:w-[320px]">
              <Icon name="search" className="pointer-events-none absolute left-3 text-ink-3" />
              <Input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or mobile"
                aria-label="Search people (press /)"
                className="pr-9 pl-9"
              />
              <Kbd className="pointer-events-none absolute right-2 hidden sm:inline-flex">/</Kbd>
            </div>
            <Segmented aria-label="Status" value={status} onValueChange={(v) => setStatus(v as UserStatusFilter)} options={STATUS_FILTERS} />
          </div>

          {users.isError || options.isError ? (
            <Callout
              tone="critical"
              action={
                <Button variant="outline" size="sm" onClick={() => void Promise.all([users.refetch(), options.refetch()])}>
                  Try again
                </Button>
              }
            >
              {problemMessage(users.error ?? options.error, "Couldn't load the people list.")}
            </Callout>
          ) : (
            <div className={cn("grid items-start gap-4", selected && "lg:grid-cols-[minmax(0,1fr)_380px]")}>
              <PeopleList users={list} loading={users.isPending} selectedId={selectedId} onSelect={setSelectedId} filtered={Boolean(q) || status !== "ACTIVE"} />
              {selected && options.data && (
                <div className="order-first lg:order-none">
                  <UserPanel key={selected.id} user={selected} options={options.data} canManage={canManage} onClose={() => setSelectedId(null)} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <InvitationsTab inviting={inviting && canInvite} onInviteDone={() => setInviting(false)} onInvite={canInvite ? () => setInviting(true) : undefined} canManage={canInvite} invitations={invitations} teamOptions={teamOptions} />
      )}
    </div>
  );
}

function PeopleList({ users, loading, selectedId, onSelect, filtered }: { users: StaffUser[]; loading: boolean; selectedId: string | null; onSelect: (id: string) => void; filtered: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  if (users.length === 0) {
    return <EmptyState className="rounded-tile shadow-[inset_0_0_0_1px_var(--line)]" title={filtered ? "Nobody matches. Try another name or filter." : "Only you so far. Invite your staff to work in MENO."} />;
  }
  return (
    <div className="overflow-hidden rounded-tile shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_110px_100px] gap-3 border-b border-line bg-side px-4 py-2 text-[12.5px] font-medium text-ink-3 md:grid" aria-hidden="true">
        <span>Name</span>
        <span>Role</span>
        <span>Branches</span>
        <span>Last sign-in</span>
        <span className="text-center">Status</span>
      </div>
      <ul className="flex flex-col divide-y divide-line" data-testid="user-list">
        {users.map((u) => {
          const status = userStatus(u.status);
          const roles = (u.roles ?? []).map((r) => r.label).join(", ");
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => onSelect(u.id ?? "")}
                aria-current={selectedId === u.id ? "true" : undefined}
                className={cn(
                  "grid w-full gap-1 px-4 py-2.5 text-left hover:bg-hover md:min-h-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_110px_100px] md:items-center md:gap-3",
                  selectedId === u.id && "bg-accent-wash",
                )}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
                    <span className="truncate">{u.fullName}</span>
                    {u.you && <Badge tint="blue">You</Badge>}
                    <span className="md:hidden">
                      <Badge tint={status.tint}>{status.label}</Badge>
                    </span>
                  </span>
                  <span className="block truncate text-[12.5px] text-ink-3">{u.email}</span>
                </span>
                <span className="truncate text-[13px] text-ink-2">{roles}</span>
                <span className="truncate text-[13px] text-ink-3">{branchSummary(u)}</span>
                <span className="hidden text-[12.5px] text-ink-3 md:block">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}</span>
                <span className="hidden justify-center md:flex">
                  <Badge tint={status.tint}>{status.label}</Badge>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InvitationsTab({
  inviting,
  onInvite,
  onInviteDone,
  canManage,
  invitations,
  teamOptions,
}: {
  inviting: boolean;
  onInvite?: () => void;
  onInviteDone: () => void;
  canManage: boolean;
  invitations: ReturnType<typeof useInvitations>;
  teamOptions: ReturnType<typeof useTeamOptions>;
}) {
  const list = invitations.data?.items ?? [];
  const noBranches = teamOptions.isSuccess && (teamOptions.data.branches ?? []).length === 0;
  return (
    <div className="flex max-w-[760px] flex-col gap-4">
      {invitations.isError && <Callout tone="critical">{problemMessage(invitations.error, "Couldn't load the invitations.")}</Callout>}
      {inviting && noBranches && <Callout tone="warning">Add a branch first: each person works at one or more branches.</Callout>}
      {inviting && teamOptions.data && !noBranches && (
        <div className="rounded-tile p-4 shadow-[inset_0_0_0_1px_var(--line)]">
          <InviteForm key={list.length} options={teamOptions.data} onDone={onInviteDone} onCancel={onInviteDone} />
        </div>
      )}
      {invitations.isPending ? (
        <Skeleton className="h-28" />
      ) : list.length === 0 ? (
        !inviting && (
          <EmptyState
            className="rounded-tile shadow-[inset_0_0_0_1px_var(--line)]"
            title="No invitations yet."
            action={
              onInvite && (
                <Button variant="outline" onClick={onInvite}>
                  <Icon name="user-plus" />
                  Invite person
                </Button>
              )
            }
          />
        )
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-tile shadow-[inset_0_0_0_1px_var(--line)]" data-testid="invitation-list">
          {list.map((i) => (
            <InvitationRow key={i.id} invitation={i} canManage={canManage} />
          ))}
        </ul>
      )}
      <p className="text-[12.5px] text-ink-3">People appear under People once they open their link and set a password.</p>
    </div>
  );
}
