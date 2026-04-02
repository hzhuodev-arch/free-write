import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { streamDocument } from "./document";

const http = httpRouter();

http.route({
  path: "/stream-document",
  method: "POST",
  handler: streamDocument,
});

http.route({
  path: "/stream-document",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
