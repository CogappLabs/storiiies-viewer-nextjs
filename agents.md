# Agent Guidelines

Guidelines for AI agents working on the Storiiies Editor codebase.

## Project Overview

Storiiies Editor is a Next.js application for creating IIIF annotation stories. Users can annotate IIIF images and preview them in various IIIF viewers.

## Architecture

### Key Technologies
- **Next.js 16** with App Router
- **Prisma** with SQLite for data persistence
- **Tailwind CSS 4** for styling
- **OpenSeadragon** for image viewing
- **Annotorious** for drawing annotations

### Directory Structure
- `src/app/` - Next.js pages and API routes
- `src/components/` - React components
- `src/components/ui/` - Reusable UI primitives (Button, Header, etc.)
- `src/lib/` - Server actions and utilities
- `prisma/` - Database schema and migrations

### Data Flow
1. Stories are created via `createStory` server action
2. Annotations are drawn in `AnnotatedViewer` (OpenSeadragon + Annotorious)
3. Data is stored in SQLite via Prisma
4. IIIF manifests are generated on-demand via `/api/manifest/[id]`

## Coding Conventions

### Components
- Use the `ui/` folder for reusable primitives
- Import from `@/components/ui` using the barrel export
- Full-screen pages (editor, preview) manage their own layout
- Standard pages use `min-h-screen bg-cogapp-cream` wrapper

### Styling
- Use Cogapp brand colors defined in `globals.css`:
  - `cogapp-charcoal` (#282828) - headers, primary buttons
  - `cogapp-cream` (#ebebe1) - page backgrounds
  - `cogapp-blue` (#227bff) - focus rings, active states
- Button variants: `primary`, `secondary`, `ghost`, `danger`
- Headers use the `<Header>` component for consistency

### Server Actions
- Located in `src/lib/actions.ts`
- Use `revalidatePath` after mutations
- Handle errors gracefully

### Database
- Schema in `prisma/schema.prisma`
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync database

## Common Tasks

### Adding a New Page
1. Create file in `src/app/[route]/page.tsx`
2. Use `<Header>` component for consistent navigation
3. Wrap content in `min-h-screen bg-cogapp-cream` for standard pages

### Adding UI Components
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Follow existing patterns (Button, Header)

### Modifying the Database
1. Update `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Update affected server actions

### Testing Viewers
Preview pages are available at:
- `/preview/storiiies/[id]` - Storiiies Viewer
- `/preview/clover/[id]` - Clover
- `/preview/mirador/[id]` - Mirador
- `/preview/annona/[id]` - Annona

## Build & Lint

```bash
npm run build    # Build for production
npm run lint     # Run ESLint
npm run dev      # Development server
```

## Notes

- The project uses Biome for formatting (see `biome.json`)
- IIIF manifests follow Presentation API 3.0 specification
- Annotations store both the drawn rectangle and viewport bounds for accurate playback
