import { Effect } from "effect";
import type { Id } from "../_generated/dataModel";
import { MutationDb, QueryDb } from "../service/db";
import type { Mode } from "../shared/types";
import { DocumentDbError, get, patch } from "./document";

export const setActiveStreamId = (
  id: string,
  activeStreamId: string | undefined,
) => patch(id, { activeStreamId });

export const clearActiveStream = (id: string) =>
  patch(id, { activeStreamId: undefined });

export const registerStream = (args: {
  documentId: string;
  streamId: string;
  content: string;
  mode: Mode;
  additionalPrompt?: string;
}) =>
  Effect.gen(function* () {
    const db = yield* MutationDb;
    yield* Effect.tryPromise({
      try: () =>
        db.insert("streamingJobs", {
          streamId: args.streamId,
          documentId: args.documentId as Id<"documents">,
          content: args.content,
          mode: args.mode,
          additionalPrompt: args.additionalPrompt,
        }),
      catch: (error) => new DocumentDbError({ operation: "insert", error }),
    });
    yield* patch(args.documentId, { activeStreamId: args.streamId });
  });

export const finishStream = (args: {
  documentId: string;
  streamId: string;
  content: string;
}) =>
  Effect.gen(function* () {
    const doc = yield* get(args.documentId);
    if (doc.activeStreamId !== args.streamId) return;
    yield* patch(args.documentId, {
      content: args.content,
      activeStreamId: undefined,
    });
  });

export const getJob = (streamId: string) =>
  Effect.gen(function* () {
    const db = yield* QueryDb;
    return yield* Effect.tryPromise({
      try: () =>
        db
          .query("streamingJobs")
          .withIndex("by_streamId", (q) => q.eq("streamId", streamId))
          .first(),
      catch: (error) => new DocumentDbError({ operation: "get", error }),
    });
  });
