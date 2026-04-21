import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useUserId } from "#/lib/hooks/use-user-id";
import { Spinner } from "@/design-system/components/spinner";
import DocumentPage from "@/editor/components/DocumentPage";

export function DocumentEntry() {
  const userId = useUserId();
  const documents = useQuery(api.documents.listByUserId, { userId });

  if (documents === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white dark:bg-zinc-950">
        <Spinner className="size-5 text-zinc-500 dark:text-zinc-400" />
      </div>
    );
  }

  return <DocumentPage documents={documents} />;
}
