import { Clock, Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import { SESSION_STALE_TIME_MS } from "../../shared/const";
import type { Session } from "../../shared/types";
import { getDocument, updateDocument } from "./crud";
import { InvalidSessionError } from "./errors";

export const validateSession = (args: {
  docId: Id<"documents">;
  sessionId: string;
}) =>
  Effect.gen(function* () {
    const doc = yield* getDocument(args.docId);
    const now = yield* Clock.currentTimeMillis;
    const valid =
      doc.activeSession === undefined ||
      doc.activeSession.sessionId === args.sessionId ||
      now - doc.activeSession.lastUpdatedAt > SESSION_STALE_TIME_MS;
    if (!valid) return yield* new InvalidSessionError();
    return valid;
  });

export const updateDocumentSession = (args: {
  docId: Id<"documents">;
  session: Session;
}) =>
  updateDocument({
    documentId: args.docId,
    fields: { activeSession: args.session },
  });
