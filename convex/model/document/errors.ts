import { Schema } from "effect";

export class DocumentNotFoundError extends Schema.TaggedErrorClass<DocumentNotFoundError>()(
  "DocumentNotFoundError",
  {},
) {}

export class DocumentDbError extends Schema.TaggedErrorClass<DocumentDbError>()(
  "DocumentDbError",
  {
    operation: Schema.String,
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export class InvalidSessionError extends Schema.TaggedErrorClass<InvalidSessionError>()(
  "InvalidSessionError",
  {},
) {}

export class StreamJobNotFoundError extends Schema.TaggedErrorClass<StreamJobNotFoundError>()(
  "StreamJobNotFoundError",
  {},
) {}

export class StreamError extends Schema.TaggedErrorClass<StreamError>()(
  "StreamError",
  {
    operation: Schema.String,
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}
