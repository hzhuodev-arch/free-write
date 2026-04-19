import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useUserId } from "#/hooks/use-user-id";
import DocumentPage from "@/components/DocumentPage";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/")({
  component: Index,
  ssr: false,
});

function Index() {
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
