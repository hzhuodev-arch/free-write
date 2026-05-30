import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { Effect, Layer, ServiceMap } from "effect";
import type { Doc, Id } from "../_generated/dataModel";
import type { AnyDb, MutationDb } from "../runtime/db";
import type { Mode } from "../shared/types";
import { StreamJobPersistenceError } from "./errors";

const streamJobDb = <A>(
  operation: StreamJobPersistenceError["operation"],
  run: () => Promise<A>,
) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => new StreamJobPersistenceError({ operation, cause }),
  });

export class StreamJobRepository extends ServiceMap.Service<
  StreamJobRepository,
  {
    readonly insert: (args: {
      readonly documentId: Id<"documents">;
      readonly streamId: StreamId;
      readonly content: string;
      readonly mode: Mode;
      readonly additionalPrompt?: string;
    }) => Effect.Effect<void, StreamJobPersistenceError>;
    readonly getByStreamId: (
      streamId: string,
    ) => Effect.Effect<Doc<"streamingJobs"> | null, StreamJobPersistenceError>;
  }
>()("StreamJobRepository") {}

export const streamJobRepositoryLayer = (db: AnyDb) => {
  const mutationDb = db as MutationDb;

  return Layer.succeed(StreamJobRepository)({
    insert: (args) =>
      streamJobDb("insert", () =>
        mutationDb.insert("streamingJobs", {
          streamId: args.streamId,
          documentId: args.documentId,
          content: args.content,
          mode: args.mode,
          additionalPrompt: args.additionalPrompt,
        }),
      ).pipe(Effect.asVoid),
    getByStreamId: (streamId) =>
      streamJobDb("get", () =>
        db
          .query("streamingJobs")
          .withIndex("by_streamId", (q) => q.eq("streamId", streamId))
          .first(),
      ),
  });
};
