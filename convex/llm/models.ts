import { AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenRouterLanguageModel } from "@effect/ai-openrouter";

export const MODELS = {
  "kimi-k2.5": OpenRouterLanguageModel.model("moonshotai/kimi-k2.5"),
  "minimax-m2.5": OpenRouterLanguageModel.model("minimax/minimax-m2.5"),
  "deepseek-v3.2": OpenRouterLanguageModel.model("deepseek/deepseek-v3.2"),
  "claude-sonnet-4-6": AnthropicLanguageModel.model("claude-sonnet-4-6"),
} as const;
