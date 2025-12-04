# Agent Guidelines

Guidelines for AI agents working on the Storiiies Editor codebase.

## Project Overview

Storiiies Editor is a Next.js application for creating IIIF annotation stories. Users can annotate IIIF images and preview them in various IIIF viewers.

## Architecture

### Key Technologies
- **Next.js 16** with App Router and Turbopack
- **Prisma** with SQLite for data persistence
- **Tailwind CSS 4** for styling
- **OpenSeadragon** for IIIF tiled image viewing
- **Annotorious** for annotation editing (resize/reposition)
- **Biome** for linting and formatting

### Directory Structure
- `src/app/` - Next.js pages and API routes
- `src/components/` - React components
- `src/components/ui/` - Reusable UI primitives (Button, Header, etc.)
- `src/lib/` - Server actions and utilities
- `prisma/` - Database schema and migrations

### Data Flow
1. Stories are created via `createStory` server action
2. Annotations are created at the current viewport position via `getViewportBounds()`
3. Annotations can be resized/repositioned using Annotorious
4. Data is stored in SQLite via Prisma
5. IIIF manifests are generated on-demand via `/api/manifest/[id]`

### Image Loading
- OpenSeadragon uses IIIF Image API (`info.json`) for efficient tiled rendering
- The manifest includes IIIF Image Service references for viewer compatibility
- Images are loaded progressively based on zoom level

## Coding Conventions

### Functions
- Use arrow functions throughout the codebase
- Export named functions for server actions

### Components
- Use the `ui/` folder for reusable primitives
- Import from `@/components/ui` using the barrel export
- Full-screen pages (editor, preview) manage their own layout
- Standard pages use `min-h-screen bg-cogapp-cream` wrapper
- Use `forwardRef` when components need to expose methods via ref

### Styling
- Use Cogapp brand colors defined in `globals.css`:
  - `cogapp-charcoal` (#282828) - headers, primary buttons
  - `cogapp-cream` (#ebebe1) - page backgrounds
  - `cogapp-lavender` (#e8daff) - focus rings, active states
  - `cogapp-light-blue` - selected/active states background
- Button variants: `primary`, `secondary`, `ghost`, `danger`
- Headers use the `<Header>` component for consistency

### Server Actions
- Located in `src/lib/actions.ts`
- Use `revalidatePath` after mutations
- Wrap in try-catch for error handling
- Validate inputs using helper functions (`getString`, `getPositiveInt`, `isValidUrl`)

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
npm run build           # Build for production
npx biome check         # Run linting checks
npx biome check --write # Auto-fix issues
npx tsc --noEmit        # Type check
npm run dev             # Development server
```

## Notes

- The project uses Biome for formatting (see `biome.json`)
- IIIF manifests follow Presentation API 3.0 specification
- Annotations store both the rectangle coordinates and viewport bounds for accurate playback
- Modals should support Escape key to close
- Use Next.js `<Image>` component for optimized image loading where appropriate
