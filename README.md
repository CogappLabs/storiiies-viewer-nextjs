# Storiiies Editor

A local-first editor for creating IIIF annotation stories. Create annotated narratives from IIIF images and preview them in multiple IIIF viewers.

## Features

- Create stories from any IIIF image URL
- Draw annotation regions on images with OpenSeadragon
- Drag-and-drop reordering of annotations
- Add images to annotations
- Preview stories in multiple IIIF viewers:
  - Storiiies Viewer
  - Clover
  - Mirador
  - Annona
- Export as IIIF Presentation API 3.0 manifests

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Prisma
- **Styling**: Tailwind CSS 4
- **Image Viewer**: OpenSeadragon with Annotorious
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd storiiies-editor-local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (manifest generation)
│   ├── editor/             # Story editor
│   └── preview/            # Viewer previews (storiiies, clover, mirador, annona)
├── components/             # React components
│   ├── ui/                 # Reusable UI components (Button, Header, etc.)
│   ├── Editor.tsx          # Main editor component
│   ├── AnnotatedViewer.tsx # OpenSeadragon viewer with annotations
│   └── AnnotationList.tsx  # Draggable annotation list
├── lib/                    # Utilities and server actions
└── generated/              # Prisma generated client
```

## Usage

1. **Create a Story**: Enter a IIIF image URL (info.json) on the home page
2. **Add Annotations**: Click "Add" and draw rectangles on the image
3. **Edit Content**: Add text and optional images to each annotation
4. **Reorder**: Drag annotations to change their order
5. **Preview**: Use the "Share" button to preview in different IIIF viewers
6. **Export**: Copy the manifest URL to use in any IIIF-compatible viewer

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
