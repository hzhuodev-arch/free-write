import type { AiError } from "effect/unstable/ai";
import type {
  DocumentNotFoundError,
  DocumentPersistenceError,
  InvalidDocumentSessionError,
} from "../documents/errors";
import { StreamJobPersistenceError } from "../stream/errors";

export type BackendError =
  | DocumentNotFoundError
  | DocumentPersistenceError
  | InvalidDocumentSessionError
  | StreamJobPersistenceError
  | AiError.AiError;

export const toConvexError = (error: unknown): Error => {
  const tag =
    typeof error === "object" && error !== null
      ? "_tag" in error
        ? error._tag
        : undefined
      : undefined;

  switch (tag) {
    case "DocumentNotFoundError":
      return new Error("Document not found");
    case "InvalidDocumentSessionError":
      return new Error("Document session is locked");
    case "DocumentPersistenceError":
      return new Error("Document persistence failed", { cause: error });
    case "StreamJobPersistenceError":
      return new Error("Stream job persistence failed", { cause: error });
    case "ConfigError":
      // A missing/invalid OPEN_ROUTER_API_KEY surfaces as an Effect ConfigError
      // when the provider layer is built.
      return new Error("OPEN_ROUTER_API_KEY is not configured", {
        cause: error,
      });
    case "AiError":
      return new Error("Language model request failed", { cause: error });
    default:
      return error instanceof Error
        ? error
        : new Error("Backend failure", { cause: error });
  }
};
