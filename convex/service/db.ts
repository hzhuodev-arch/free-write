import { Effect, ServiceMap } from "effect";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export class QueryDb extends ServiceMap.Service<
  QueryDb,
  QueryCtx["db"]
>()("free-write/convex/service/db/QueryDb") {}

export class MutationDb extends ServiceMap.Service<
  MutationDb,
  MutationCtx["db"]
>()("free-write/convex/service/db/MutationDb") {}

export const provideQueryDb = (ctx: QueryCtx) =>
  Effect.provideService(QueryDb, ctx.db);

export const provideMutationDb = <A, E, R>(ctx: MutationCtx) =>
  (eff: Effect.Effect<A, E, R>) =>
    eff.pipe(
      Effect.provideService(MutationDb, ctx.db),
      Effect.provideService(QueryDb, ctx.db),
    );

// ---------- Handler helpers ----------
// Run an Effect inside a Convex function with db services already provided.

export const runQuery =
  <A, E, R extends QueryDb>(build: Effect.Effect<A, E, R>) =>
  (ctx: QueryCtx): Promise<A> =>
    Effect.runPromise(
      build.pipe(provideQueryDb(ctx)) as Effect.Effect<A, E, never>,
    );

export const runMutation =
  <A, E, R extends QueryDb | MutationDb>(build: Effect.Effect<A, E, R>) =>
  (ctx: MutationCtx): Promise<A> =>
    Effect.runPromise(
      build.pipe(provideMutationDb(ctx)) as Effect.Effect<A, E, never>,
    );
