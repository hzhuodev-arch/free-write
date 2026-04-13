<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->


## React

React Compiler is enabled. Do not add `useMemo`, `useCallback`, or `memo` unless it's something that cannot be handled by the compiler

Do not use `transition-colors` or `transition-all` on elements that have `dark:` variant classes. This causes theme toggles to animate slowly instead of switching instantly. Use specific transition properties (e.g., `transition-shadow`, `transition-transform`) when animation is needed.

## Package Management

This project uses **pnpm**. Always use `pnpm add <package>` (not `npm install`). Using npm will update `package.json` but not `pnpm-lock.yaml`, causing Vercel builds to fail with `ERR_PNPM_OUTDATED_LOCKFILE`.

## Fixing Problems

- When addressing a bug or issue, strive to do so in a maintainable way, meaning that if possible, the solution should reduce complexity and makes codebase easier to reason about instead of creating more complexity to patch those bugs  
- Revert the previous changes you made if that turned out to not be the right solution