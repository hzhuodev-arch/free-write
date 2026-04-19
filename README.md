# free-write

Write whatever — prose, dashes, indentation, half-formed thoughts. Hit ⌘S, an LLM rewrites it into clean Markdown.

## why it exists

Hobby project. A bit over-engineered because I wanted to paly with
- **Convex.** Sync engine and its hard to beat DX. Tried to deliver best possible local-first UX with optimistic updates.
- **Effect's LLM pattern.** Treating the model as an injected dependency and building execution plans around it — retries, fallbacks, structured errors — that pattern made a lot of sense to me.

## stack

- **TanStack Start** — frontend
- **Convex** — sync engine + backend
- **Effect** — error & dependency management, LLM interface
