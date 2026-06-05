import { type Config, Effect, Layer } from "effect";
import { documentRepositoryLayer } from "../documents/repository";
import { documentServiceLive } from "../documents/service";
import { openRouterModelLayer } from "../llm/provider";
import { llmServiceLive } from "../llm/service";
import { streamJobRepositoryLayer } from "../stream/repository";
import { streamServiceLive } from "../stream/service";
import { appClockLive } from "./clock";
import type { AnyDb } from "./db";
import { toConvexError } from "./errors";

export const backendLayer = (db: AnyDb) => {
  const repositories = Layer.mergeAll(
    appClockLive,
    documentRepositoryLayer(db),
    streamJobRepositoryLayer(db),
  );
  const services = Layer.mergeAll(documentServiceLive, streamServiceLive);
  return services.pipe(Layer.provide(repositories));
};

export const llmLayer = Layer.mergeAll(llmServiceLive, openRouterModelLayer);

export const runBackendEffect = <A, E, R>(
  db: AnyDb,
  effect: Effect.Effect<A, E, R>,
) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(backendLayer(db) as Layer.Layer<R, never, never>),
      Effect.mapError(toConvexError),
    ),
  );

export const runLlmEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(
    effect.pipe(
      // The provider layer can fail with a ConfigError (missing API key); that
      // failure flows into the effect's error channel and is mapped below.
      Effect.provide(llmLayer as Layer.Layer<R, Config.ConfigError>),
      Effect.mapError(toConvexError),
    ),
  );
