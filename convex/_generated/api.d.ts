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
import type * as document from "../document.js";
import type * as http from "../http.js";
import type * as llm_models from "../llm/models.js";
import type * as llm_prompts_documentFormat from "../llm/prompts/documentFormat.js";
import type * as llm_providers from "../llm/providers.js";
import type * as model_document_collectDocumentsByUserId from "../model/document/collectDocumentsByUserId.js";
import type * as model_document_createDocument from "../model/document/createDocument.js";
import type * as model_document_createStream from "../model/document/createStream.js";
import type * as model_document_crud from "../model/document/crud.js";
import type * as model_document_deleteDocument from "../model/document/deleteDocument.js";
import type * as model_document_errors from "../model/document/errors.js";
import type * as model_document_getDocument from "../model/document/getDocument.js";
import type * as model_document_session from "../model/document/session.js";
import type * as model_document_stream from "../model/document/stream.js";
import type * as model_document_streamProcessedContent from "../model/document/streamProcessedContent.js";
import type * as model_document_updateDocument from "../model/document/updateDocument.js";
import type * as model_document_updateDocumentSession from "../model/document/updateDocumentSession.js";
import type * as model_document_validateSession from "../model/document/validateSession.js";
import type * as shared_const from "../shared/const.js";
import type * as shared_httpRoutes from "../shared/httpRoutes.js";
import type * as shared_types from "../shared/types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  components: typeof components_;
  document: typeof document;
  http: typeof http;
  "llm/models": typeof llm_models;
  "llm/prompts/documentFormat": typeof llm_prompts_documentFormat;
  "llm/providers": typeof llm_providers;
  "model/document/collectDocumentsByUserId": typeof model_document_collectDocumentsByUserId;
  "model/document/createDocument": typeof model_document_createDocument;
  "model/document/createStream": typeof model_document_createStream;
  "model/document/crud": typeof model_document_crud;
  "model/document/deleteDocument": typeof model_document_deleteDocument;
  "model/document/errors": typeof model_document_errors;
  "model/document/getDocument": typeof model_document_getDocument;
  "model/document/session": typeof model_document_session;
  "model/document/stream": typeof model_document_stream;
  "model/document/streamProcessedContent": typeof model_document_streamProcessedContent;
  "model/document/updateDocument": typeof model_document_updateDocument;
  "model/document/updateDocumentSession": typeof model_document_updateDocumentSession;
  "model/document/validateSession": typeof model_document_validateSession;
  "shared/const": typeof shared_const;
  "shared/httpRoutes": typeof shared_httpRoutes;
  "shared/types": typeof shared_types;
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
