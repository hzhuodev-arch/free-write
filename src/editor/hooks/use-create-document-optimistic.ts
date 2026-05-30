import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef } from "react";

export function useCreateDocumentOptimistic(userId: string) {
  const tempIdRef = useRef<string | null>(null);

  const createDoc = useMutation(api.documents.create).withOptimisticUpdate(
    (store, args) => {
      const tempId = tempIdRef.current;
      if (!tempId) return;
      const current =
        store.getQuery(api.documents.listByUserId, { userId }) ?? [];
      store.setQuery(api.documents.listByUserId, { userId }, [
        {
          id: tempId as Id<"documents">,
          creationTime: Date.now(),
          userId: args.userId,
          content: "",
          title: "",
          activeStreamId: undefined,
          activeSession: undefined,
        },
        ...current,
      ]);
    },
  );

  return () => {
    const tempId = crypto.randomUUID();
    tempIdRef.current = tempId;
    return {
      tempId,
      resolve: createDoc({ userId }).finally(() => {
        tempIdRef.current = null;
      }),
    };
  };
}
