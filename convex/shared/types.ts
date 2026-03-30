export const MODES = ["format", "restructure"] as const;
export type Mode = (typeof MODES)[number];
