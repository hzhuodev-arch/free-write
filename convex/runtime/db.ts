import type { MutationCtx, QueryCtx } from "../_generated/server";

export type QueryDb = QueryCtx["db"];
export type MutationDb = MutationCtx["db"];
export type AnyDb = QueryDb | MutationDb;
