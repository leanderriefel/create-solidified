# create-solidified

A CLI scaffolding tool for SolidJS projects with composable features.

## Usage

```bash
bunx create-solidified my-app
```

## Architecture

We have:

1. **Base templates** - Minimal starter projects for each framework
2. **Feature generators** - Independent addons that modify the base template

```
User selections → Copy base template → Apply generators → Done
```

## Project Structure

```
src/
├── index.tsx                 # Entry point + TUI
├── generators/               # Feature generators
│   ├── index.ts              # Generator registry & orchestrator
│   ├── tailwind.ts           # Tailwind CSS v4
│   ├── vitest.ts             # Vitest + testing-library
│   └── biome.ts              # Biome linter/formatter
├── templates/                # Base project templates
│   └── vite-solid-router/    # Vite + Solid Router template
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
└── utils/
    ├── types.ts              # TypeScript types
    ├── fs.ts                 # File utilities (copy, addDeps, etc.)
    ├── vite.ts               # Vite config manipulation
    └── scaffold.ts           # Main scaffolding orchestrator
```

## How Generators Work

Each generator is a self-contained module that:

1. Adds its dependencies to `package.json`
2. Creates necessary config files
3. Modifies existing files (e.g., adds Vite plugins, CSS imports)

```ts
// Example: generators/tailwind.ts
export const tailwindGenerator: Generator = {
  name: "tailwind",
  async apply(dir) {
    await addDependencies(
      dir,
      { tailwindcss: "^4", "@tailwindcss/vite": "^4" },
      true
    )
    await prependToFile(dir, "src/app.css", '@import "tailwindcss";')
    await addVitePlugin(dir, { name: "tailwindcss", from: "@tailwindcss/vite" })
  },
}
```

## Adding a New Generator

1. Create a new file in `src/generators/` (e.g., `prisma.ts`)
2. Export a `Generator` object with `name` and `apply()` function
3. Register it in `src/generators/index.ts`

## Adding a New Template

1. Create a new directory in `src/templates/` (e.g., `solid-start/`)
2. Add minimal project files (package.json, config files, src/)
3. Update the `Framework` type in `src/utils/types.ts`

---

## TODO / Components

- Package Manager:
  - npm
  - pnpm
  - yarn
  - bun
- Frameworks:
  - Vite /w Solid Router
  - Start
  - Tanstack Start
- Styles:
  - None
  - Tailwind CSS
  - UnoCSS
  - Sass/SCSS
- Database:
  - None
  - Drizzle ORM
  - Prisma ORM
- Authentication:
  - None
  - Better Auth
  - Clerk
- API/Backend:
  - None
  - tRPC
  - Hono
- Testing:
  - None
  - Vitest
  - Playwright
- Linting:
  - None
  - Biome
  - ESLint
  - Oxlint
- Formatting:
  - None
  - Biome
  - Prettier
  - Oxfmt
- Git Hooks:
  - None
  - Husky
  - lint-staged
- Deployment:
  - None
  - Vercel
  - Netlify
  - Cloudflare
