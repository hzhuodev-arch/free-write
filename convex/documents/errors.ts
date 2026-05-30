import { Data } from "effect";

export class DocumentNotFoundError extends Data.TaggedError(
  "DocumentNotFoundError",
)<{
  readonly documentId: string;
}> {}

export class DocumentPersistenceError extends Data.TaggedError(
  "DocumentPersistenceError",
)<{
  readonly operation: "get" | "list" | "insert" | "patch" | "delete";
  readonly cause: unknown;
}> {}

export class InvalidDocumentSessionError extends Data.TaggedError(
  "InvalidDocumentSessionError",
)<{
  readonly documentId: string;
  readonly sessionId: string;
}> {}
