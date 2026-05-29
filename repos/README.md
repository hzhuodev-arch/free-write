# Vendored Reference Repositories

This directory contains squashed git subtrees for source-level reference material. These repos are here so coding agents can inspect real implementations, tests, examples, and package structure while continuing to write app code against normal dependencies.

## Rules

- Treat everything under `repos/` as read-only unless updating vendored sources.
- Do not import from `repos/` in application code.
- Do not run normal app checks inside these repos.
- Keep all vendored repositories under this directory.

## Current Repositories

- `repos/effect` from `https://github.com/Effect-TS/effect.git`
- `repos/tanstack-router` from `https://github.com/TanStack/router.git`
- `repos/convex-js` from `https://github.com/get-convex/convex-js.git`

## Updating

Use squashed subtree pulls from the project root:

```sh
git subtree pull --prefix=repos/effect https://github.com/Effect-TS/effect.git main --squash
git subtree pull --prefix=repos/tanstack-router https://github.com/TanStack/router.git main --squash
git subtree pull --prefix=repos/convex-js https://github.com/get-convex/convex-js.git main --squash
```

If the app worktree has unrelated local edits, update from a temporary clean worktree and cherry-pick the resulting subtree merge commit back into the main worktree.
