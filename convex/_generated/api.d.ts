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
import type * as http from "../http.js";
import type * as llm_models from "../llm/models.js";
import type * as llm_prompts_documentFormat from "../llm/prompts/documentFormat.js";
import type * as llm_providers from "../llm/providers.js";
import type * as llm_stream from "../llm/stream.js";
import type * as model_document from "../model/document.js";
import type * as model_stream from "../model/stream.js";
import type * as service_db from "../service/db.js";
import type * as shared_const from "../shared/const.js";
import type * as shared_document from "../shared/document.js";
import type * as shared_httpRoutes from "../shared/httpRoutes.js";
import type * as shared_types from "../shared/types.js";
import type * as shared_util from "../shared/util.js";
import type * as stream from "../stream.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  components: typeof components_;
  documents: typeof documents;
  http: typeof http;
  "llm/models": typeof llm_models;
  "llm/prompts/documentFormat": typeof llm_prompts_documentFormat;
  "llm/providers": typeof llm_providers;
  "llm/stream": typeof llm_stream;
  "model/document": typeof model_document;
  "model/stream": typeof model_stream;
  "service/db": typeof service_db;
  "shared/const": typeof shared_const;
  "shared/document": typeof shared_document;
  "shared/httpRoutes": typeof shared_httpRoutes;
  "shared/types": typeof shared_types;
  "shared/util": typeof shared_util;
  stream: typeof stream;
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
