"use client";

import { useRouter } from "next/navigation";
import { Button, Icon, Popover, PopoverContent, PopoverTrigger } from "@meno/ui";
import { useLogout, useLogoutAll } from "@/features/auth/queries";
import { useSessionUser } from "@/lib/session";

/** Who is signed in, and sign out (here or everywhere). DESIGN_LANGUAGE §5 "user menu". */
export function UserMenu() {
  const user = useSessionUser();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const router = useRouter();
  const toLogin = { onSettled: () => router.replace("/login/") };
  const name = user?.fullName ?? user?.email ?? "Account";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Account: ${name}`} data-testid="user-menu">
          <Icon name="user" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]">
        <div className="border-b border-line px-2.5 pt-1.5 pb-2.5">
          <p className="truncate font-medium text-ink">{name}</p>
          {user?.email && <p className="truncate text-[12.5px] text-ink-3">{user.email}</p>}
          {user?.roles?.length ? <p className="mt-0.5 text-[12px] text-ink-4">{user.roles.join(", ").toLowerCase()}</p> : null}
        </div>
        <div className="flex flex-col pt-1.5">
          <Button variant="ghost" className="justify-start" onClick={() => logout.mutate(undefined, toLogin)} loading={logout.isPending} data-testid="sign-out">
            <Icon name="log-out" />
            Sign out
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => logoutAll.mutate(undefined, toLogin)} loading={logoutAll.isPending} data-testid="sign-out-all">
            <Icon name="log-out" />
            Sign out of all devices
          </Button>
          <p className="px-2.5 pt-1 pb-1.5 text-[12px] text-ink-4">For a shared or lost computer: every browser and counter PC has to sign in again.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
