# Tools & Toolkits

A **Tool** is a typed, schema-validated capability the model can invoke. A **Toolkit** groups
tools and binds them to **handlers** (the code that actually runs). The library validates
params on the way in, runs your handler, and validates/encodes the result on the way out.

## Define a tool — `Tool.make`

```ts
import { Tool } from "@effect/ai"
import { Schema } from "effect"

const GetWeather = Tool.make("GetWeather", {
  description: "Get current weather for a location",
  parameters: {                       // a record of Schema fields (becomes a Struct)
    location: Schema.String,
    units: Schema.Literal("celsius", "fahrenheit")
  },
  success: Schema.Struct({            // schema for a successful result
    temperature: Schema.Number,
    condition: Schema.String
  }),
  failure: Schema.Never,             // optional; schema for typed failures
  failureMode: "error"               // "error" (default) | "return"
})
```

Notes:
- `description` is what the model sees — write it like a prompt. The `parameters` schema's
  field docs/annotations also reach the model as JSON Schema.
- All config is optional. A no-arg tool is valid (`Tool.make("GetCurrentTime", { success: Schema.Number })`).
- **`failureMode`** controls what happens when a handler fails:
  - `"error"` (default) — the failure goes to the calling effect's **error channel**.
  - `"return"` — the failure is **captured into the tool result** and fed back to the model
    (so the model can react to it). Use this when the model should recover from tool errors.

### Tools with dependencies

A handler can require Effect services. Declare them so the requirement is tracked at the type
level and must be provided before generation runs:

```ts
const Lookup = Tool.make("Lookup", { parameters: { id: Schema.String }, success: Schema.String })
  .addDependency(Database) // Context.Tag — now Database appears in the tool's Requirements
```

### Provider-defined tools

Tools built into the provider (web search, code execution) are declared with
`Tool.providerDefined`. They execute on the provider side; you only optionally supply a
handler to post-process results.

```ts
const WebSearch = Tool.providerDefined({
  id: "openai.web_search",
  toolkitName: "WebSearch",
  providerName: "web_search",
  args: { query: Schema.String },
  success: Schema.Struct({ /* ... */ })
})
```

## Group into a Toolkit — `Toolkit.make`

```ts
import { Toolkit } from "@effect/ai"

const MyToolkit = Toolkit.make(GetCurrentTime, GetWeather)
```

Merge toolkits with `Toolkit.merge(a, b, ...)` (later tools win on name conflicts);
`Toolkit.empty` is the identity starting point.

## Bind handlers — `toLayer` / `toContext`

Handlers are keyed by tool name. Each returns an `Effect<Success, Failure, Requirements>`.
`toLayer` produces a `Layer` you provide alongside the model.

```ts
const MyToolkitLayer = MyToolkit.toLayer({
  GetCurrentTime: () => Effect.succeed(Date.now()),
  GetWeather: ({ location, units }) =>
    Effect.succeed({ temperature: 72, condition: "sunny" })
})
```

The handler `build` can itself be an `Effect` (e.g. to acquire dependencies), and only tools
that *require* a handler must appear in the record. Use `MyToolkit.of({...})` for a type-safe
handler literal without building a layer.

## Use a toolkit in generation

Pass the toolkit on the generation call. By default the framework **auto-resolves** tool
calls: it runs the matching handler, validates the result, and loops the result back. The
final `response.toolCalls` / `response.toolResults` expose what happened.

```ts
const program = Effect.gen(function* () {
  const response = yield* LanguageModel.generateText({
    prompt: "What's the weather in Paris?",
    toolkit: MyToolkit,           // or an Effect yielding MyToolkit
    toolChoice: "auto",
    concurrency: "unbounded"
  })
  return response.text
}).pipe(Effect.provide(MyToolkitLayer))
```

Set `disableToolCallResolution: true` to receive tool-call parts **without** executing
handlers — useful when you want to approve or route calls before running them.

## Why this design

The schema boundary means malformed model output (bad params) and malformed handler output
both surface as typed `AiError`s rather than runtime surprises, and tool requirements/errors
propagate into the generation call's type signature — so the compiler tells you what to
provide and what can fail.
