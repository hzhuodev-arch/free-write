/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as components_ from "../components.js";
import type * as documents from "../documents.js";
import type * as documents_errors from "../documents/errors.js";
import type * as documents_repository from "../documents/repository.js";
import type * as documents_service from "../documents/service.js";
import type * as http from "../http.js";
import type * as llm_models from "../llm/models.js";
import type * as llm_prompts_documentFormat from "../llm/prompts/documentFormat.js";
import type * as llm_provider from "../llm/provider.js";
import type * as llm_service from "../llm/service.js";
import type * as runtime_clock from "../runtime/clock.js";
import type * as runtime_db from "../runtime/db.js";
import type * as runtime_errors from "../runtime/errors.js";
import type * as runtime_layers from "../runtime/layers.js";
import type * as shared_const from "../shared/const.js";
import type * as shared_document from "../shared/document.js";
import type * as shared_httpRoutes from "../shared/httpRoutes.js";
import type * as shared_types from "../shared/types.js";
import type * as stream from "../stream.js";
import type * as stream_errors from "../stream/errors.js";
import type * as stream_repository from "../stream/repository.js";
import type * as stream_service from "../stream/service.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  components: typeof components_;
  documents: typeof documents;
  "documents/errors": typeof documents_errors;
  "documents/repository": typeof documents_repository;
  "documents/service": typeof documents_service;
  http: typeof http;
  "llm/models": typeof llm_models;
  "llm/prompts/documentFormat": typeof llm_prompts_documentFormat;
  "llm/provider": typeof llm_provider;
  "llm/service": typeof llm_service;
  "runtime/clock": typeof runtime_clock;
  "runtime/db": typeof runtime_db;
  "runtime/errors": typeof runtime_errors;
  "runtime/layers": typeof runtime_layers;
  "shared/const": typeof shared_const;
  "shared/document": typeof shared_document;
  "shared/httpRoutes": typeof shared_httpRoutes;
  "shared/types": typeof shared_types;
  stream: typeof stream;
  "stream/errors": typeof stream_errors;
  "stream/repository": typeof stream_repository;
  "stream/service": typeof stream_service;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  persistentTextStreaming: {
    lib: {
      addChunk: FunctionReference<
        "mutation",
        "internal",
        { final: boolean; streamId: string; text: string },
        any
      >;
      createStream: FunctionReference<"mutation", "internal", {}, any>;
      getStreamStatus: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        "pending" | "streaming" | "done" | "error" | "timeout"
      >;
      getStreamText: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          text: string;
        }
      >;
      setStreamStatus: FunctionReference<
        "mutation",
        "internal",
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          streamId: string;
        },
        any
      >;
    };
  };
};
