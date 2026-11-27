"use client";

import { Button, Callout, PageHeader, Skeleton } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useReferenceDatasets } from "../queries";
import { usePlatformStaff } from "../session";
import { DatasetCard } from "./DatasetCard";

/** /platform/reference-data (PLT-22): every shared list with its source, licence, size and refresh status. */
export function ReferenceDataScreen() {
  const datasets = useReferenceDatasets();
  const staff = usePlatformStaff();
  const canLoad = staff?.permissions?.includes("platform.reference.manage") ?? false;
  const items = datasets.data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Reference data"
        description="Shared lists every pharmacy looks up: PIN codes fill addresses, IFSC fills bank details. Load the official file when a refresh is due; the whole list is replaced at once."
      />
      {datasets.isError && (
        <Callout tone="critical" action={<Button variant="outline" size="sm" onClick={() => datasets.refetch()}>Try again</Button>}>
          {problemMessage(datasets.error, "Couldn't load the reference lists.")}
        </Callout>
      )}
      {datasets.isPending && <Skeleton className="h-80" />}
      <div className="flex flex-col gap-3" data-testid="dataset-list">
        {items.map((d) => (
          <DatasetCard key={d.code} dataset={d} canLoad={canLoad} />
        ))}
      </div>
    </>
  );
}
