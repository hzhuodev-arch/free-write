import { Schema } from "effect";

export class DocumentNotFoundError extends Schema.TaggedErrorClass<DocumentNotFoundError>()(
  "DocumentNotFoundError",
  {
    documentId: Schema.String,
  },
) {}

export class DocumentPersistenceError extends Schema.TaggedErrorClass<DocumentPersistenceError>()(
  "DocumentPersistenceError",
  {
    operation: Schema.Literals(["get", "list", "insert", "patch", "delete"]),
    cause: Schema.Unknown,
  },
) {}

export class InvalidDocumentSessionError extends Schema.TaggedErrorClass<InvalidDocumentSessionError>()(
  "InvalidDocumentSessionError",
  {
    documentId: Schema.String,
    sessionId: Schema.String,
  },
) {}
