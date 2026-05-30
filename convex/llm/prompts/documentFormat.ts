import type { Mode } from "../../shared/types";

export const constructPrompt = (
  content: string,
  mode: Mode,
  additionalPrompt?: string,
) => {
  const userInstruction =
    mode === "format"
      ? "Fix typos and grammatical errors, but preserve the author's exact wording, tone, and phrasing otherwise. Infer structure from informal signals (arrows, dashes, bullets, indentation, shorthand, line breaks, and other symbols) and convert them into proper markdown."
      : "Fix typos and grammatical errors. You may reorder, restructure, and reorganize content for improved clarity, but preserve the author's language and voice.";

  const extra = additionalPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${additionalPrompt.trim()}`
    : "";

  return [
    {
      role: "system",
      content:
        "You are a markdown formatter. Output ONLY valid markdown, no commentary.",
    },
    {
      role: "user",
      content: [
        { type: "text", text: `${userInstruction}${extra}\n\n${content}` },
      ],
    },
  ] as const;
};
