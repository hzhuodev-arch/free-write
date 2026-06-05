import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { Effect, Layer, ServiceMap } from "effect";
import type { Doc, Id } from "../_generated/dataModel";
import type {
  DocumentNotFoundError,
  DocumentPersistenceError,
} from "../documents/errors";
import { DocumentRepository } from "../documents/repository";
import type { Mode } from "../shared/types";
import type { StreamJobPersistenceError } from "./errors";
import { StreamJobRepository } from "./repository";

export class StreamService extends ServiceMap.Service<
  StreamService,
  {
    readonly register: (args: {
      readonly documentId: Id<"documents">;
      readonly streamId: StreamId;
      readonly content: string;
      readonly mode: Mode;
      readonly additionalPrompt?: string;
    }) => Effect.Effect<
      void,
      DocumentPersistenceError | StreamJobPersistenceError
    >;
    readonly clearActiveStream: (
      documentId: Id<"documents">,
    ) => Effect.Effect<void, DocumentPersistenceError>;
    readonly finish: (args: {
      readonly documentId: Id<"documents">;
      readonly streamId: string;
      readonly content: string;
    }) => Effect.Effect<void, DocumentNotFoundError | DocumentPersistenceError>;
    readonly getJob: (
      streamId: string,
    ) => Effect.Effect<Doc<"streamingJobs"> | null, StreamJobPersistenceError>;
  }
>()("StreamService") {}

export const streamServiceLive = Layer.effect(StreamService)(
  Effect.gen(function* () {
    const documents = yield* DocumentRepository;
    const jobs = yield* StreamJobRepository;

    return {
      register: (args) =>
        Effect.gen(function* () {
          yield* jobs.insert(args);
          yield* documents.patch(args.documentId, {
            activeStreamId: args.streamId,
          });
        }),
      clearActiveStream: (documentId) =>
        documents.patch(documentId, { activeStreamId: undefined }),
      finish: ({ documentId, streamId, content }) =>
        Effect.gen(function* () {
          const document = yield* documents.get(documentId);
          if (document.activeStreamId !== streamId) return;

          yield* documents.patch(documentId, {
            content,
            activeStreamId: undefined,
          });
        }),
      getJob: (streamId) => jobs.getByStreamId(streamId),
    };
  }),
);
