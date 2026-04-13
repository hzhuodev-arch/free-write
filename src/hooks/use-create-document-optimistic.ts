import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef } from "react";

export function useCreateDocumentOptimistic(
  documents: Doc<"documents">[],
  userId: string,
) {
  const tempIdRef = useRef<string | null>(null);

  const createDoc = useMutation(api.document.create).withOptimisticUpdate(
    (store, args) => {
      const tempId = tempIdRef.current;
      if (!tempId) return;
      store.setQuery(api.document.collectByUserId, { userId }, [
        {
          _id: tempId as Id<"documents">,
          _creationTime: Date.now(),
          userId: args.userId,
          content: "",
          title: "",
          activeStreamId: undefined,
          activeSession: undefined,
        },
        ...documents,
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
