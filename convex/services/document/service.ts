import { type Effect, Layer, ServiceMap } from "effect";
import type { AiError } from "effect/unstable/ai";
import type { Mode } from "../../shared/types";
import { transformContent } from "./transformContent";

// Interface
export class DocumentService extends ServiceMap.Service<
  DocumentService,
  {
    transformContent: (
      content: string,
      mode: Mode,
    ) => Effect.Effect<string, AiError.AiError>;
  }
>()("free-write/convex/services/document/DocumentService") {}

// Implementation
export const DocumentServiceLayer = Layer.succeed(DocumentService, {
  transformContent: transformContent,
});
