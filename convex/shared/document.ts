import { Schema } from "effect";

export const SessionSchema = Schema.Struct({
  sessionId: Schema.String,
  lastUpdatedAt: Schema.Number,
});

export const DocumentSchema = Schema.Struct({
  id: Schema.String,
  creationTime: Schema.Number,
  userId: Schema.String,
  title: Schema.String,
  content: Schema.String,
  activeStreamId: Schema.optional(Schema.String),
  activeSession: Schema.optional(SessionSchema),
});

export type Document = typeof DocumentSchema.Type;

export type Session = typeof SessionSchema.Type;
