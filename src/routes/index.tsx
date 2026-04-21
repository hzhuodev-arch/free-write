import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DocumentEntry } from "@/editor/components/DocumentEntry";

const searchSchema = z.object({
  view: z.enum(["editor", "split", "preview"]).catch("split"),
});

export const Route = createFileRoute("/")({
  component: DocumentEntry,
  validateSearch: searchSchema,
  ssr: false,
});
