"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@meno/ui";
import { usePlatformStaff } from "../session";

/** Staff pages: no staff session (first visit, reload, expired token) → /platform/login with ?next=. */
export function RequirePlatformSession({ children }: { children: React.ReactNode }) {
  const staff = usePlatformStaff();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!staff) router.replace(`/platform/login/?next=${encodeURIComponent(pathname)}`);
  }, [staff, pathname, router]);

  if (!staff) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col gap-3 p-6" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}
