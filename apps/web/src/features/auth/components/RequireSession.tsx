"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@meno/ui";
import { useSession } from "../queries";

/** Signed-in pages: waits for the session restore, sends anonymous visitors to /login with ?next=. */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const anonymous = session.isSuccess && !session.data;

  useEffect(() => {
    if (anonymous || session.isError) router.replace(`/login/?next=${encodeURIComponent(pathname)}`);
  }, [anonymous, session.isError, pathname, router]);

  if (!session.data) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col gap-3 p-6" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}
