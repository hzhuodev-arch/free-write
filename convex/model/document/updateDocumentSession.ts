import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { Session } from "../../shared/types";
import { updateDocument } from "./updateDocument";

type Args = {
  docId: Id<"documents">;
  session: Session;
};
export const updateDocumentSession = (ctx: MutationCtx, args: Args) =>
  Effect.gen(function* () {
    return yield* updateDocument(ctx, {
      documentId: args.docId,
      fields: {
        activeSession: args.session,
      },
    });
  });
