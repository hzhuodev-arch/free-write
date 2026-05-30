import { Effect, Layer, ServiceMap } from "effect";

export class AppClock extends ServiceMap.Service<
  AppClock,
  {
    readonly currentTimeMillis: Effect.Effect<number>;
  }
>()("AppClock") {}

export const appClockLive = Layer.succeed(AppClock)({
  currentTimeMillis: Effect.sync(() => Date.now()),
});

export const appClockFixed = (now: number) =>
  Layer.succeed(AppClock)({
    currentTimeMillis: Effect.succeed(now),
  });
