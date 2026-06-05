import { Schema } from "effect";

export class StreamJobPersistenceError extends Schema.TaggedErrorClass<StreamJobPersistenceError>()(
  "StreamJobPersistenceError",
  {
    operation: Schema.Literals(["get", "insert"]),
    cause: Schema.Unknown,
  },
) {}
