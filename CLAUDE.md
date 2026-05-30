<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Vendored Reference Repositories

This project vendors external source repositories under `repos/` so coding agents can inspect real implementation patterns locally.

- Treat `repos/` as read-only reference material unless the user explicitly asks to update vendored sources.
- Prefer examples, tests, and implementation patterns from the relevant vendored repo over guesses or isolated web snippets.
- Do not import from `repos/`; application code should continue importing from normal package dependencies.
- Do not run dependency installs, formatters, or tests from inside `repos/` as part of normal app work.
- If explicitly reintroducing Effect code, inspect `repos/effect/` and read `repos/effect/AGENTS.md` first.
- When writing TanStack Router, TanStack Start, or router plugin code, inspect `repos/tanstack-router/` and read `repos/tanstack-router/AGENTS.md` first.
- When working with Convex package internals or client/server APIs, inspect `repos/convex-js/`; when working on this app's Convex code, still read `convex/_generated/ai/guidelines.md` first.

## React

React Compiler is enabled. Do not add `useMemo`, `useCallback`, or `memo` unless it's something that cannot be handled by the compiler

Do not use `transition-colors` or `transition-all` on elements that have `dark:` variant classes. This causes theme toggles to animate slowly instead of switching instantly. Use specific transition properties (e.g., `transition-shadow`, `transition-transform`) when animation is needed.

## Package Management

This project uses **pnpm**. Always use `pnpm add <package>` (not `npm install`). Using npm will update `package.json` but not `pnpm-lock.yaml`, causing Vercel builds to fail with `ERR_PNPM_OUTDATED_LOCKFILE`.

## Fixing Problems

- When addressing a bug or issue, strive to do so in a maintainable way, meaning that if possible, the solution should reduce complexity and makes codebase easier to reason about instead of creating more complexity to patch those bugs  
- Revert the previous changes you made if that turned out to not be the right solution
