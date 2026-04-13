import { Clock, Effect, Schema } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { SESSION_STALE_TIME_MS } from "../../shared/const";
import { getDocument } from "./getDocument";

type Args = {
  docId: Id<"documents">;
  sessionId: string;
};

class InvalidSessionError extends Schema.TaggedErrorClass<InvalidSessionError>()(
  "InvalidSessionError",
  {},
) {}

export const validateSession = (ctx: QueryCtx, args: Args) =>
  Effect.gen(function* () {
    const doc = yield* getDocument(ctx, args.docId);
    const now = yield* Clock.currentTimeMillis;
    const valid =
      doc.activeSession === undefined ||
      doc.activeSession.sessionId === args.sessionId ||
      now - doc.activeSession.lastUpdatedAt > SESSION_STALE_TIME_MS;
    if (!valid) return yield* new InvalidSessionError();
    return valid;
  });
