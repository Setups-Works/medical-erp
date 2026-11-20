"use client";

import { ActivityFeed } from "@/components/feeds";
import { PageHeader } from "@/components/page";
import { useActivity } from "@/lib/client";
import { useLookups } from "@/lib/maps";

export default function ActivityPage() {
  const { data } = useActivity("limit=200");
  const { userMap, boardMap } = useLookups();
  return (
    <div className="mx-auto max-w-[940px]">
      <PageHeader title="Activity" subtitle="Every change on every board, newest first. Updates live." />
      <div className="card p-3">
        <ActivityFeed items={data} users={userMap} boards={boardMap} />
      </div>
    </div>
  );
}
