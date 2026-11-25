"use client";

import * as Popover from "@radix-ui/react-popover";
import { formatDistanceToNowStrict } from "date-fns";
import { Activity, Bell, CheckSquare, ChevronDown, Compass, Files, GraduationCap, Home, KanbanSquare, ListChecks, LogOut, Map, Menu as MenuIcon, Moon, Settings, Sun, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { api, refresh, useBoards, useMe, useNotifications, useUsers } from "@/lib/client";
import { useLive } from "./live";
import { Avatar, AvatarStack, Button, Menu } from "./ui";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/start", label: "Start here", icon: Compass },
  { href: "/my-tasks", label: "My tasks", icon: CheckSquare },
  { href: "/boards", label: "Boards", icon: KanbanSquare },
  { href: "/features", label: "Features", icon: ListChecks },
  { href: "/pages", label: "Pages", icon: Files },
  { href: "/product", label: "Product map", icon: Map },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/team", label: "Team", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { data: boards } = useBoards();
  const { data: me } = useMe();
  useEffect(() => setOpen(false), [path]);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link href="/" className="mb-3 flex items-baseline gap-2 px-2 pt-1">
        <span className="font-brand text-[26px] leading-none tracking-[-0.02em]">MENO</span>
        <span className="text-[12px] font-medium text-ink-3">Hub</span>
      </Link>
      {NAV.map((n) => {
        const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn("flex h-8 items-center gap-2.5 rounded-ctl px-2 text-[13.5px] text-ink-2 hover:bg-hover hover:text-ink", active && "bg-hover font-medium text-ink")}
          >
            <n.icon className="size-4" strokeWidth={1.75} />
            {n.label}
          </Link>
        );
      })}
      <p className="mt-4 mb-1 px-2 text-[11.5px] font-medium uppercase tracking-wide text-ink-4">Boards</p>
      <div className="scroll-thin -mx-1 flex-1 overflow-y-auto px-1">
        {boards?.map((b) => {
          const active = path === `/boards/${b.id}`;
          const pct = b.total ? Math.round((b.done / b.total) * 100) : 0;
          return (
            <Link
              key={b.id}
              href={`/boards/${b.id}`}
              className={cn("flex h-8 items-center gap-2 rounded-ctl px-2 text-[13px] text-ink-2 hover:bg-hover hover:text-ink", active && "bg-hover font-medium text-ink")}
            >
              <span className="truncate flex-1">{b.name}</span>
              <span className="font-mono text-[11px] text-ink-4 tabular-nums">{pct}%</span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/settings"
        className={cn("flex h-8 items-center gap-2.5 rounded-ctl px-2 text-[13.5px] text-ink-2 hover:bg-hover hover:text-ink", path === "/settings" && "bg-hover text-ink")}
      >
        <Settings className="size-4" strokeWidth={1.75} /> Settings
      </Link>
      {me?.mustChangePassword && <p className="mx-2 mt-1 rounded-ctl at-amber tint px-2 py-1.5 text-[12px]">Change your temporary password in Settings.</p>}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-side lg:block print:hidden!">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/20" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[264px] bg-side shadow-pop">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px] print:pl-0!">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="flex-1 px-[clamp(16px,3vw,40px)] py-7 print:p-0!">{children}</main>
      </div>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: users } = useUsers();
  const { online, connected } = useLive();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("hub-theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const onlineUsers = users?.filter((u) => online.includes(u.id)) ?? [];

  return (
    <header className="sticky top-0 z-20 flex h-12 print:hidden! items-center gap-2 border-b border-line bg-paper/95 px-[clamp(12px,3vw,40px)] backdrop-blur-0">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <MenuIcon className="size-4" />
      </Button>
      <div className="flex-1" />
      <span className="hidden items-center gap-2 text-[12.5px] text-ink-3 sm:flex" title={connected ? "Changes appear live" : "Reconnecting…"}>
        <span className={cn("size-1.5 rounded-full", connected ? "bg-success" : "bg-warning")} />
        {connected ? "Live" : "Reconnecting"}
        <AvatarStack users={onlineUsers} size={22} />
      </span>
      <Notifications />
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? "Switch to light" : "Switch to dark"}>
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <Menu.Root>
        <Menu.Trigger asChild>
          <button className="flex h-8 items-center gap-1.5 rounded-ctl px-1.5 hover:bg-hover" aria-label="Account">
            <Avatar user={me} size={24} />
            <ChevronDown className="size-3.5 text-ink-3" />
          </button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content align="end" sideOffset={6} className="z-50 min-w-52 rounded-tile bg-raised p-1 shadow-pop">
            <div className="px-2 py-2">
              <p className="text-[13.5px] font-medium">{me?.name}</p>
              <p className="text-[12px] text-ink-3">{me?.title}</p>
            </div>
            <Menu.Item onSelect={() => router.push("/settings")} className="flex cursor-pointer items-center gap-2 rounded-tab px-2 py-1.5 text-[13.5px] outline-none data-[highlighted]:bg-hover">
              <Settings className="size-4" /> Settings
            </Menu.Item>
            <Menu.Item onSelect={logout} className="flex cursor-pointer items-center gap-2 rounded-tab px-2 py-1.5 text-[13.5px] outline-none data-[highlighted]:bg-hover">
              <LogOut className="size-4" /> Sign out
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </header>
  );
}

function Notifications() {
  const router = useRouter();
  const { data } = useNotifications();
  const unread = data?.unread ?? 0;

  async function open(n: { id: string; boardId?: string; taskId?: string }) {
    await api("/api/notifications", { method: "POST", json: { ids: [n.id] } });
    refresh("/api/notifications");
    if (n.boardId) router.push(`/boards/${n.boardId}${n.taskId ? `?task=${n.taskId}` : ""}`);
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-pill bg-coral px-1 text-[10px] font-semibold leading-4 text-paper">{unread}</span>}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} className="z-50 w-[340px] rounded-tile bg-raised shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <span className="text-[13.5px] font-medium">Notifications</span>
            {unread > 0 && (
              <button
                className="text-[12.5px] text-ink-3 hover:text-ink"
                onClick={async () => {
                  await api("/api/notifications", { method: "POST", json: { all: true } });
                  refresh("/api/notifications");
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="scroll-thin max-h-96 overflow-y-auto p-1">
            {!data?.items.length && <p className="p-4 text-center text-[13px] text-ink-3">You’re all caught up.</p>}
            {data?.items.map((n) => (
              <button key={n.id} onClick={() => open(n)} className="flex w-full gap-2 rounded-ctl px-2 py-2 text-left hover:bg-hover">
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-coral")} />
                <span className="min-w-0">
                  <span className="block text-[13px] text-ink">{n.text}</span>
                  <span className="text-[11.5px] text-ink-4">{formatDistanceToNowStrict(new Date(n.createdAt))} ago</span>
                </span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
