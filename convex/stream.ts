import {
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";
import { Effect, Stream } from "effect";
import { internal } from "./_generated/api";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { streaming } from "./components";
import { DocumentService } from "./documents/service";
import { streamModelPlan } from "./llm/provider";
import { LlmService } from "./llm/service";
import { runBackendEffect, runLlmEffect } from "./runtime/layers";
import { StreamService } from "./stream/service";

// ---------- Stream content query ----------

export const body = query({
  args: { streamId: StreamIdValidator },
  handler: (ctx, args) =>
    streaming.getStreamBody(ctx, args.streamId as StreamId),
});

// ---------- Lifecycle: create / finish / cancel ----------

export const create = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
    additionalPrompt: v.optional(v.string()),
    sessionId: v.string(),
  },
  returns: StreamIdValidator,
  handler: async (ctx, args) => {
    await runBackendEffect(
      ctx.db,
      DocumentService.use((_) =>
        _.validateSession({
          docId: args.documentId,
          sessionId: args.sessionId,
        }),
      ),
    );

    const streamId = await streaming.createStream(ctx);
    await runBackendEffect(
      ctx.db,
      StreamService.use((_) =>
        _.register({
          documentId: args.documentId,
          streamId,
          content: args.content,
          mode: args.mode,
          additionalPrompt: args.additionalPrompt,
        }),
      ),
    );

    return streamId;
  },
});

export const cancel = mutation({
  args: { documentId: v.id("documents") },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      StreamService.use((_) => _.clearActiveStream(args.documentId)),
    ),
});

export const finish = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    streamId: v.string(),
  },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      StreamService.use((_) =>
        _.finish({
          documentId: args.documentId,
          content: args.content,
          streamId: args.streamId,
        }),
      ),
    ),
});

export const getJob = internalQuery({
  args: { streamId: v.string() },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      StreamService.use((_) => _.getJob(args.streamId)),
    ),
});

// ---------- HTTP handler: drives the stream ----------

export const streamDocument = httpAction(async (ctx, req) => {
  let streamId: string;
  try {
    const body = (await req.json()) as { streamId?: string };
    if (!body.streamId)
      return new Response("Missing streamId", { status: 400 });
    streamId = body.streamId;
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const job = await ctx.runQuery(internal.stream.getJob, { streamId });
  if (!job) return new Response("Job not found", { status: 404 });

  const response = await streaming.stream(
    ctx,
    req,
    streamId as StreamId,
    async (_ctx, _req, _streamId, chunkAppender) => {
      // Drive the LanguageModel stream: forward each text delta to the client as
      // it arrives, and fold the deltas into the full document text. Failures
      // surface through runLlmEffect (mapped to a plain Error) and reject here.
      const fullText = await runLlmEffect(
        LlmService.use((llm) =>
          llm
            .streamContent({
              content: job.content,
              mode: job.mode,
              additionalPrompt: job.additionalPrompt,
            })
            .pipe(
              // Retry each model with exponential backoff, then fall back to the
              // next (gemini → kimi → minimax). `preventFallbackOnPartialStream`
              // stops a fallback once deltas have already reached the client, so
              // the surviving stream is never contaminated with partial output.
              Stream.withExecutionPlan(streamModelPlan, {
                preventFallbackOnPartialStream: true,
              }),
              Stream.tap((delta) => Effect.promise(() => chunkAppender(delta))),
              Stream.runFold(
                () => "",
                (acc, delta) => acc + delta,
              ),
            ),
        ),
      );

      await ctx.runMutation(internal.stream.finish, {
        documentId: job.documentId,
        content: fullText,
        streamId,
      });
    },
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
