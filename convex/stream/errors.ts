import { Data } from "effect";

export class StreamJobPersistenceError extends Data.TaggedError(
  "StreamJobPersistenceError",
)<{
  readonly operation: "get" | "insert";
  readonly cause: unknown;
}> {}
