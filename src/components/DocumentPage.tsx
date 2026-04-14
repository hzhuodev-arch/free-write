import type { Doc, Id } from "@convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCreateDocumentOptimistic } from "#/hooks/use-create-document-optimistic";
import { usePersistedState } from "#/hooks/use-persisted-state";
import { useSessionId } from "#/hooks/use-session-id";
import { useUserId } from "#/hooks/use-user-id";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DocEditor from "./DocEditor";
import AppSidebar from "./Sidebar";

interface DocumentPageProps {
  documents: Doc<"documents">[];
}

export default function DocumentPage({ documents }: DocumentPageProps) {
  const userId = useUserId();
  const sessionId = useSessionId();
  const [selectedDocId, setSelectedDocId] = usePersistedState<string | null>(
    "free-write:selected-doc-id",
    null,
  );
  // Stable key for DocEditor that survives the optimistic fake→real ID swap
  const [optimisticDocKey, setOptimisticDocKey] = useState<string | null>(null);

  const createDocument = useCreateDocumentOptimistic(documents, userId);

  const activeDoc =
    documents.find((d) => d._id === selectedDocId) ?? documents[0] ?? undefined;
  const isOptimisticDoc =
    optimisticDocKey != null && activeDoc?._id === optimisticDocKey;

  const handleCreate = async () => {
    const result = createDocument();
    setOptimisticDocKey(result.tempId);
    setSelectedDocId(result.tempId);
    try {
      const realId = await result.resolve;
      setSelectedDocId(realId);
    } catch {
      setOptimisticDocKey(null);
      setSelectedDocId(null);
    }
  };

  const handleSelect = (docId: Id<"documents">) => {
    setSelectedDocId(docId);
    setOptimisticDocKey(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        documents={documents}
        selectedDocId={activeDoc?._id ?? null}
        onCreate={handleCreate}
        onSelect={handleSelect}
      />
      <SidebarInset className="h-dvh overflow-hidden bg-white dark:bg-zinc-950">
        {activeDoc ? (
          <DocEditor
            key={optimisticDocKey ?? activeDoc._id}
            doc={activeDoc}
            sessionId={sessionId}
            ready={!isOptimisticDoc}
          />
        ) : (
          <EmptyState onCreate={handleCreate} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <button
        type="button"
        onClick={onCreate}
        className={cn(
          "flex items-center gap-2 rounded-lg px-5 py-3",
          "text-sm font-medium",
          "border border-zinc-200 bg-white text-zinc-700",
          "hover:border-zinc-300 hover:text-zinc-900",
          "active:bg-zinc-50",
          "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
          "dark:hover:border-zinc-600 dark:hover:text-zinc-100",
          "dark:active:bg-zinc-800/80",
        )}
      >
        <Plus className="h-4 w-4" />
        Create new document
      </button>
    </div>
  );
}
