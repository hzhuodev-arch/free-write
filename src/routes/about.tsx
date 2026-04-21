import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/shell/components/AboutPage";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
