import { Effect, Layer, ServiceMap } from "effect";
import type { Id } from "../_generated/dataModel";
import { AppClock } from "../runtime/clock";
import { SESSION_STALE_TIME_MS } from "../shared/const";
import type { Document } from "../shared/document";
import {
  type DocumentNotFoundError,
  type DocumentPersistenceError,
  InvalidDocumentSessionError,
} from "./errors";
import { DocumentRepository } from "./repository";

type DocumentError =
  | DocumentNotFoundError
  | DocumentPersistenceError
  | InvalidDocumentSessionError;

const canUseSession = (document: Document, sessionId: string, now: number) =>
  document.activeSession === undefined ||
  document.activeSession.sessionId === sessionId ||
  now - document.activeSession.lastUpdatedAt > SESSION_STALE_TIME_MS;

export class DocumentService extends ServiceMap.Service<
  DocumentService,
  {
    readonly listByUserId: (
      userId: string,
    ) => Effect.Effect<Document[], DocumentError>;
    readonly create: (
      userId: string,
    ) => Effect.Effect<Id<"documents">, DocumentError>;
    readonly remove: (
      id: Id<"documents">,
    ) => Effect.Effect<void, DocumentError>;
    readonly updateTitle: (
      id: Id<"documents">,
      title: string,
    ) => Effect.Effect<void, DocumentError>;
    readonly updateContent: (args: {
      readonly docId: Id<"documents">;
      readonly content: string;
      readonly sessionId: string;
    }) => Effect.Effect<void, DocumentError>;
    readonly validateSession: (args: {
      readonly docId: Id<"documents">;
      readonly sessionId: string;
    }) => Effect.Effect<void, DocumentError>;
    readonly claimSession: (args: {
      readonly docId: Id<"documents">;
      readonly sessionId: string;
    }) => Effect.Effect<void, DocumentError>;
    readonly releaseSession: (args: {
      readonly docId: Id<"documents">;
      readonly sessionId: string;
    }) => Effect.Effect<void, DocumentError>;
  }
>()("DocumentService") {}

export const documentServiceLive = Layer.effect(DocumentService)(
  Effect.gen(function* () {
    const repository = yield* DocumentRepository;
    const clock = yield* AppClock;

    return {
      listByUserId: (userId) => repository.listForUser(userId),
      create: (userId) => repository.create({ userId }),
      remove: (id) => repository.remove(id),
      updateTitle: (id, title) => repository.patch(id, { title }),
      validateSession: ({ docId, sessionId }) =>
        Effect.gen(function* () {
          const document = yield* repository.get(docId);
          const now = yield* clock.currentTimeMillis;

          if (!canUseSession(document, sessionId, now)) {
            return yield* new InvalidDocumentSessionError({
              documentId: docId,
              sessionId,
            });
          }
        }),
      updateContent: ({ docId, sessionId, content }) =>
        Effect.gen(function* () {
          const document = yield* repository.get(docId);
          const now = yield* clock.currentTimeMillis;

          if (!canUseSession(document, sessionId, now)) {
            return yield* new InvalidDocumentSessionError({
              documentId: docId,
              sessionId,
            });
          }

          yield* repository.patch(docId, {
            content,
            activeSession: { sessionId, lastUpdatedAt: now },
          });
        }),
      claimSession: ({ docId, sessionId }) =>
        Effect.gen(function* () {
          const now = yield* clock.currentTimeMillis;
          yield* repository.patch(docId, {
            activeSession: { sessionId, lastUpdatedAt: now },
          });
        }),
      releaseSession: ({ docId, sessionId }) =>
        Effect.gen(function* () {
          const document = yield* repository.get(docId);
          if (document.activeSession?.sessionId !== sessionId) return;
          yield* repository.patch(docId, { activeSession: undefined });
        }),
    };
  }),
);
