import {
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";
import { Effect, pipe, Stream } from "effect";
import { components, internal } from "./_generated/api";
import {
  httpAction,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { streamContent } from "./model/document/streamProcessedContent";

const streaming = new PersistentTextStreaming(
  components.persistentTextStreaming,
);

// ── Mutations ──────────────────────────────────────────────────────────────

export const createStream = mutation({
  args: v.object({
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
  }),
  returns: StreamIdValidator,
  handler: async (ctx, args) => {
    const streamId = await streaming.createStream(ctx);
    await ctx.db.insert("streamingJobs", {
      streamId,
      content: args.content,
      mode: args.mode,
    });
    return streamId;
  },
});

// ── Queries ────────────────────────────────────────────────────────────────

export const streamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) =>
    streaming.getStreamBody(ctx, args.streamId as StreamId),
});

export const getJob = internalQuery({
  args: { streamId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("streamingJobs")
      .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
      .first(),
});

// ── HTTP ───────────────────────────────────────────────────────────────────

export const streamDocument = httpAction(async (ctx, req) => {
  const { streamId } = (await req.json()) as { streamId: string };

  const job = await ctx.runQuery(internal.document.getJob, { streamId });
  if (!job) return new Response("Job not found", { status: 404 });

  const response = await streaming.stream(
    ctx,
    req,
    streamId as StreamId,
    async (_ctx, _req, _streamId, chunkAppender) => {
      await pipe(
        streamContent(job.content, job.mode),
        Stream.runForEach((part) => Effect.promise(() => chunkAppender(part))),
        Effect.runPromise,
      );
    },
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
