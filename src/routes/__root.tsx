import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import { type Theme, ThemeContext } from "@/context/theme";

import appCss from "@/styles.css?url";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
  unsavedChangesWarning: false,
});

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

function RootDocument({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") setTheme("dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <html
        lang="en"
        className={theme === "dark" ? "dark" : ""}
        suppressHydrationWarning
      >
        <head>
          <HeadContent />
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <setting the theme early to avoid FOUC>
            dangerouslySetInnerHTML={{
              __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
            }}
          />
        </head>
        <body
          className="font-sans antialiased wrap-anywhere"
        >
          <ConvexProvider client={convex}>{children}</ConvexProvider>
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </body>
      </html>
    </ThemeContext.Provider>
  );
}
