import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { Effect, pipe, Stream } from "effect";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { streaming } from "./components";
import {
  StreamError,
  StreamJobNotFoundError,
} from "./model/document/errors";
import { streamContent } from "./model/document/stream";

export const streamDocument = httpAction(async (ctx, req) =>
  Effect.gen(function* () {
    const { streamId } = yield* Effect.tryPromise({
      try: () => req.json() as Promise<{ streamId: string }>,
      catch: (error) => new StreamError({ operation: "parseRequest", error }),
    });

    const job = yield* Effect.tryPromise({
      try: () => ctx.runQuery(internal.document.getJob, { streamId }),
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

            await ctx.runMutation(internal.document.finishStream, {
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
