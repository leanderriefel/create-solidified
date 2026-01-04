# Agents Guide

Guide for working on the **create-solidified** CLI scaffolding tool.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **TUI**: @opentui/react (solid version was too buggy)
- **Purpose**: SolidJS project scaffolding tool

## Project Architecture

This project scaffolds other SolidJS projects. It is NOT the generated projects themselves.

```
src/
├── generators/     # Generator implementation code (modules that scaffold features)
├── templates/      # Base project templates (minimal starter projects to copy)
├── utils/          # Shared utilities for the CLI (fs, vite, scaffold, types)
└── index.tsx       # CLI entry point + TUI interface
```

## Code Conventions

- **Modular**: Keep files short and focused - reflects the project's modular nature
- **Use existing utilities**: Don't reinvent file operations; use `src/utils/fs.ts`
- **TypeScript**: Strict typing for all functions
- **Async**: All generator operations and file operations are async

## Working on the CLI/TUI

Location: `src/index.tsx`

- Uses React-like syntax with @opentui/react components
- State management with React hooks (`useState`, `useMemo`, `useCallback`)
- Keyboard input via `useKeyboard` hook
- Follow existing step pattern: name → pm → framework → style → confirm → done
- Color palette defined at top of file - use `c.primary`, `c.accent`, etc.

## Adding a New Generator

Generator code goes in `src/generators/[feature].ts`:

1. Import types: `import type { Generator, ProjectConfig } from "../utils/types"`
2. Export a `Generator` object with `name` and `apply(dir, config)`
3. Use utilities from `src/utils/fs.ts`: `addDependencies()`, `prependToFile()`, `addVitePlugin()`, `writeFile()`, `copyFile()`
4. Use all your available tools to research the most up to date version of the feature you are adding.

```ts
import type { Generator, ProjectConfig } from "../utils/types"

export const myGenerator: Generator = {
  name: "my-feature",
  async apply(dir: string, config: ProjectConfig) {
    await addDependencies(dir, { "my-dep": "^1.0" })
    await writeFile(dir, "config.json", "{}")
  },
}
```

4. Register in `src/generators/index.ts`:
   - Import at top
   - Add to `generators` record
   - Add logic to `getGeneratorsForConfig()` function

5. **Always research if the generator dependencies and configurations are up to date**:
   - Use web search, code search, and documentation tools to verify latest versions
   - Check for any breaking changes or new best practices
   - Ensure config options align with current recommendations (e.g., `endOfLine: "lf"` for cross-platform consistency)
   - Verify npm packages use appropriate version ranges (e.g., `^3` for latest major version)

## Adding a New Template

Templates are minimal starter projects copied as base for scaffolding:

1. Create `src/templates/[template-name]/`
2. Add minimal project files: package.json, tsconfig, config files, src/
3. Update `Framework` type in `src/utils/types.ts`
4. Add template option to `FRAMEWORKS` array in `src/index.tsx`

## Utilities

Located in `src/utils/`:

- **fs.ts**: File operations for generators (read, write, addDeps, prepend, etc.)
- **vite.ts**: Vite config manipulation
- **scaffold.ts**: Main scaffolding orchestrator
- **types.ts**: TypeScript types used throughout the project

## Testing

This repository has **no tests**. Tests are optional scaffolding output for generated projects (Vitest + testing-library).

## Development

```bash
bun run dev
```

## Linting/Formatting

Oxfmt + Oxlint

When implementing generators, ensure the generator code (not the output) follows these standards.
