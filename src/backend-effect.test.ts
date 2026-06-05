import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import type { Id } from "../convex/_generated/dataModel";
import {
  DocumentNotFoundError,
  InvalidDocumentSessionError,
} from "../convex/documents/errors";
import { DocumentRepository } from "../convex/documents/repository";
import {
  DocumentService,
  documentServiceLive,
} from "../convex/documents/service";
import { appClockFixed } from "../convex/runtime/clock";
import type { Document } from "../convex/shared/document";
import { StreamJobRepository } from "../convex/stream/repository";
import { StreamService, streamServiceLive } from "../convex/stream/service";

const docId = "doc_1" as Id<"documents">;
const now = 10_000;

const makeDocument = (document: Partial<Document> = {}): Document => ({
  id: docId,
  creationTime: 1,
  userId: "user_1",
  title: "Draft",
  content: "Original",
  ...document,
});

const makeDocumentRepositoryLayer = (documents: Map<string, Document>) =>
  Layer.succeed(DocumentRepository)({
    get: (id) =>
      Effect.sync(() => documents.get(id)).pipe(
        Effect.flatMap((document) =>
          document
            ? Effect.succeed(document)
            : Effect.fail(new DocumentNotFoundError({ documentId: id })),
        ),
      ),
    listForUser: (userId) =>
      Effect.sync(() =>
        [...documents.values()].filter(
          (document) => document.userId === userId,
        ),
      ),
    create: ({ userId, title }) =>
      Effect.sync(() => {
        const id = `doc_${documents.size + 1}` as Id<"documents">;
        documents.set(id, makeDocument({ id, userId, title: title ?? "" }));
        return id;
      }),
    patch: (id, fields) =>
      Effect.sync(() => {
        const document = documents.get(id);
        if (!document) return;
        documents.set(id, { ...document, ...fields });
      }),
    remove: (id) =>
      Effect.sync(() => {
        documents.delete(id);
      }),
  });

const streamJobRepositoryStub = Layer.succeed(StreamJobRepository)({
  insert: () => Effect.void,
  getByStreamId: () => Effect.succeed(null),
});

const provideDocuments = (documents: Map<string, Document>) => {
  const repositories = Layer.mergeAll(
    makeDocumentRepositoryLayer(documents),
    streamJobRepositoryStub,
    appClockFixed(now),
  );
  const services = Layer.mergeAll(documentServiceLive, streamServiceLive);
  return services.pipe(Layer.provide(repositories));
};

describe("Effect backend services", () => {
  it("updates content and refreshes the active session when the session is valid", async () => {
    const documents = new Map<string, Document>([
      [
        docId,
        makeDocument({ activeSession: { sessionId: "s1", lastUpdatedAt: 1 } }),
      ],
    ]);

    await Effect.runPromise(
      DocumentService.use((service) =>
        service.updateContent({
          docId,
          sessionId: "s1",
          content: "Updated",
        }),
      ).pipe(Effect.provide(provideDocuments(documents))),
    );

    expect(documents.get(docId)).toMatchObject({
      content: "Updated",
      activeSession: { sessionId: "s1", lastUpdatedAt: now },
    });
  });

  it("rejects content writes while another fresh session owns the document", async () => {
    const documents = new Map<string, Document>([
      [
        docId,
        makeDocument({
          activeSession: { sessionId: "other", lastUpdatedAt: now - 100 },
        }),
      ],
    ]);

    await expect(
      Effect.runPromise(
        DocumentService.use((service) =>
          service.updateContent({
            docId,
            sessionId: "s1",
            content: "Blocked",
          }),
        ).pipe(Effect.provide(provideDocuments(documents))),
      ),
    ).rejects.toBeInstanceOf(InvalidDocumentSessionError);

    expect(documents.get(docId)?.content).toBe("Original");
  });

  it("releases only the matching active session", async () => {
    const documents = new Map<string, Document>([
      [
        docId,
        makeDocument({
          activeSession: { sessionId: "owner", lastUpdatedAt: now },
        }),
      ],
    ]);

    await Effect.runPromise(
      DocumentService.use((service) =>
        service.releaseSession({ docId, sessionId: "intruder" }),
      ).pipe(Effect.provide(provideDocuments(documents))),
    );

    expect(documents.get(docId)?.activeSession?.sessionId).toBe("owner");

    await Effect.runPromise(
      DocumentService.use((service) =>
        service.releaseSession({ docId, sessionId: "owner" }),
      ).pipe(Effect.provide(provideDocuments(documents))),
    );

    expect(documents.get(docId)?.activeSession).toBeUndefined();
  });

  it("finishes only the active stream for a document", async () => {
    const documents = new Map<string, Document>([
      [docId, makeDocument({ activeStreamId: "current" })],
    ]);

    await Effect.runPromise(
      StreamService.use((service) =>
        service.finish({
          documentId: docId,
          streamId: "old",
          content: "Stale output",
        }),
      ).pipe(Effect.provide(provideDocuments(documents))),
    );

    expect(documents.get(docId)).toMatchObject({
      content: "Original",
      activeStreamId: "current",
    });

    await Effect.runPromise(
      StreamService.use((service) =>
        service.finish({
          documentId: docId,
          streamId: "current",
          content: "Final output",
        }),
      ).pipe(Effect.provide(provideDocuments(documents))),
    );

    expect(documents.get(docId)).toMatchObject({
      content: "Final output",
      activeStreamId: undefined,
    });
  });
});
