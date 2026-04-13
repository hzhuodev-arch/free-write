export const MODES = ["format", "restructure"] as const;
export type Mode = (typeof MODES)[number];
export type Session =
  | {
      sessionId: string;
      lastUpdatedAt: number;
    }
  | undefined;
