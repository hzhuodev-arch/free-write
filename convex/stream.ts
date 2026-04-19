import {
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";
import { Effect, pipe, Schema, Stream } from "effect";
import { internal } from "./_generated/api";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { streaming } from "./components";
import { streamContent } from "./llm/stream";
import * as doc from "./model/document";
import { DocumentDbError } from "./model/document";
import * as stream from "./model/stream";
import { provideMutationDb, provideQueryDb } from "./service/db";

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
  handler: (ctx, args) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* doc.validateSession({
          docId: args.documentId,
          sessionId: args.sessionId,
        });
        const streamId = yield* Effect.tryPromise({
          try: () => streaming.createStream(ctx),
          catch: (error) => new DocumentDbError({ operation: "insert", error }),
        });
        yield* stream.registerStream({
          documentId: args.documentId,
          streamId,
          content: args.content,
          mode: args.mode,
          additionalPrompt: args.additionalPrompt,
        });
        return streamId;
      }).pipe(provideMutationDb(ctx)),
    ),
});

export const cancel = mutation({
  args: { documentId: v.id("documents") },
  handler: (ctx, args) =>
    Effect.runPromise(
      stream.clearActiveStream(args.documentId).pipe(provideMutationDb(ctx)),
    ),
});

export const finish = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    streamId: v.string(),
  },
  handler: (ctx, args) =>
    Effect.runPromise(stream.finishStream(args).pipe(provideMutationDb(ctx))),
});

export const getJob = internalQuery({
  args: { streamId: v.string() },
  handler: (ctx, args) =>
    Effect.runPromise(stream.getJob(args.streamId).pipe(provideQueryDb(ctx))),
});

// ---------- HTTP handler: drives the stream ----------

class StreamError extends Schema.TaggedErrorClass<StreamError>()(
  "StreamError",
  {
    operation: Schema.String,
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

class StreamJobNotFoundError extends Schema.TaggedErrorClass<StreamJobNotFoundError>()(
  "StreamJobNotFoundError",
  {},
) {}

export const streamDocument = httpAction(async (ctx, req) =>
  Effect.gen(function* () {
    const { streamId } = yield* Effect.tryPromise({
      try: () => req.json() as Promise<{ streamId: string }>,
      catch: (error) => new StreamError({ operation: "parseRequest", error }),
    });

    const job = yield* Effect.tryPromise({
      try: () => ctx.runQuery(internal.stream.getJob, { streamId }),
      catch: (error) => new StreamError({ operation: "getJob", error }),
    });
    if (!job) return yield* new StreamJobNotFoundError();

    let fullText = "";
    const response = yield* Effect.tryPromise({
      try: () =>
        streaming.stream(
          ctx,
          req,
          streamId as StreamId,
          async (_ctx, _req, _streamId, chunkAppender) => {
            await pipe(
              streamContent(job.content, job.mode, job.additionalPrompt),
              Stream.runForEach((part) =>
                Effect.promise(async () => {
                  fullText += part;
                  await chunkAppender(part);
                }),
              ),
              Effect.runPromise,
            );

            await ctx.runMutation(internal.stream.finish, {
              documentId: job.documentId,
              content: fullText,
              streamId,
            });
          },
        ),
      catch: (error) => new StreamError({ operation: "stream", error }),
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Vary", "Origin");
    return response;
  }).pipe(
    Effect.catchTag("StreamJobNotFoundError", () =>
      Effect.succeed(new Response("Job not found", { status: 404 })),
    ),
    Effect.runPromise,
  ),
);
