/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as document_actions from "../document/actions.js";
import type * as llm_models from "../llm/models.js";
import type * as services_document_service from "../services/document/service.js";
import type * as services_document_transformContent from "../services/document/transformContent.js";
import type * as shared_types from "../shared/types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "document/actions": typeof document_actions;
  "llm/models": typeof llm_models;
  "services/document/service": typeof services_document_service;
  "services/document/transformContent": typeof services_document_transformContent;
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

export declare const components: {};
