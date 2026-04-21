import { createRootRoute } from "@tanstack/react-router";
import { RootDocument } from "@/shell/components/RootDocument";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Free Write" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="flex h-dvh items-center justify-center">
      <p className="text-sm text-zinc-400">Page not found</p>
    </div>
  ),
});
