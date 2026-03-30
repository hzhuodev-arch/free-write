import { AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenRouterLanguageModel } from "@effect/ai-openrouter";

export const MODELS = {
  "kimi-k2.5": OpenRouterLanguageModel.model("moonshotai/kimi-k2.5:nitro"),
  "minimax-m2.5": OpenRouterLanguageModel.model("minimax/minimax-m2.5"),
  "deepseek-v3.2": OpenRouterLanguageModel.model("deepseek/deepseek-v3.2"),
  "claude-sonnet-4-6": AnthropicLanguageModel.model("claude-sonnet-4-6"),
  "qwen-3.5-flash": OpenRouterLanguageModel.model("qwen/qwen3.5-flash-02-23"),
  "gemini-3.1-flash-preview": OpenRouterLanguageModel.model(
    "google/gemini-3-flash-preview",
  ),
} as const;
