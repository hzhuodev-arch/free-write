import { Effect, ServiceMap } from "effect";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export class ConvexQueryDb extends ServiceMap.Service<
  ConvexQueryDb,
  QueryCtx["db"]
>()("free-write/convex/service/db/ConvexQueryDb") {}

export class ConvexMutationDb extends ServiceMap.Service<
  ConvexMutationDb,
  MutationCtx["db"]
>()("free-write/convex/service/db/ConvexMutationDb") {}

export const provideQueryDb = (ctx: QueryCtx) =>
  Effect.provideService(ConvexQueryDb, ctx.db);

export const provideMutationDb = <A, E, R>(ctx: MutationCtx) =>
  (eff: Effect.Effect<A, E, R>) =>
    eff.pipe(
      Effect.provideService(ConvexMutationDb, ctx.db),
      Effect.provideService(ConvexQueryDb, ctx.db),
    );
