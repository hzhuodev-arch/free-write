import { Effect, Layer, ServiceMap } from "effect";
import type { Doc, Id } from "../_generated/dataModel";
import type { AnyDb, MutationDb } from "../runtime/db";
import type { Document } from "../shared/document";
import { DocumentNotFoundError, DocumentPersistenceError } from "./errors";

const toDocument = ({
  _id,
  _creationTime,
  ...document
}: Doc<"documents">): Document => ({
  id: _id,
  creationTime: _creationTime,
  ...document,
});

const documentDb = <A>(
  operation: DocumentPersistenceError["operation"],
  run: () => Promise<A>,
) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => new DocumentPersistenceError({ operation, cause }),
  });

export class DocumentRepository extends ServiceMap.Service<
  DocumentRepository,
  {
    readonly get: (
      id: Id<"documents">,
    ) => Effect.Effect<
      Document,
      DocumentNotFoundError | DocumentPersistenceError
    >;
    readonly listForUser: (
      userId: string,
    ) => Effect.Effect<Document[], DocumentPersistenceError>;
    readonly create: (args: {
      readonly userId: string;
      readonly title?: string;
    }) => Effect.Effect<Id<"documents">, DocumentPersistenceError>;
    readonly patch: (
      id: Id<"documents">,
      fields: Partial<
        Pick<Document, "title" | "content" | "activeStreamId" | "activeSession">
      >,
    ) => Effect.Effect<void, DocumentPersistenceError>;
    readonly remove: (
      id: Id<"documents">,
    ) => Effect.Effect<void, DocumentPersistenceError>;
  }
>()("DocumentRepository") {}

export const documentRepositoryLayer = (db: AnyDb) => {
  const mutationDb = db as MutationDb;

  return Layer.succeed(DocumentRepository)({
    get: (id) =>
      documentDb("get", () => db.get(id)).pipe(
        Effect.flatMap((document) =>
          document
            ? Effect.succeed(toDocument(document))
            : Effect.fail(new DocumentNotFoundError({ documentId: id })),
        ),
      ),
    listForUser: (userId) =>
      documentDb("list", () =>
        db
          .query("documents")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .order("desc")
          .take(100),
      ).pipe(Effect.map((documents) => documents.map(toDocument))),
    create: (args) =>
      documentDb("insert", () =>
        mutationDb.insert("documents", {
          userId: args.userId,
          title: args.title ?? "",
          content: "",
        }),
      ),
    patch: (id, fields) =>
      Object.keys(fields).length === 0
        ? Effect.void
        : documentDb("patch", () => mutationDb.patch(id, fields)),
    remove: (id) => documentDb("delete", () => mutationDb.delete(id)),
  });
};
