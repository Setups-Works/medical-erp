"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@meno/ui";
import { useFetchChecklist, useSession } from "../queries";
import { landingPath } from "../utils";

/** "/" → sign-in, the set-up step to resume, or the dashboard. */
export function HomeRedirect() {
  const session = useSession();
  const router = useRouter();
  const fetchChecklist = useFetchChecklist();
  useEffect(() => {
    if (session.isPending) return;
    if (!session.data) {
      router.replace("/login/");
      return;
    }
    fetchChecklist()
      .then((c) => router.replace(landingPath(c)))
      .catch(() => router.replace("/dashboard/"));
  }, [session.isPending, session.data, router, fetchChecklist]);
  return (
    <div className="mx-auto max-w-[420px] p-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-40" />
    </div>
  );
}
