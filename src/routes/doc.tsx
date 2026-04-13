
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/doc")({
  component: DocLayout,
});

function DocLayout() {
  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-zinc-950">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
