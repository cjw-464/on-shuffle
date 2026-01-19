# On Shuffle

Music discovery web app that helps users find new music through an intuitive filtering system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)

## Core Concepts

### 7-Dial Filtering System
Interactive dial-based interface for filtering music by various attributes. Users adjust dials to discover tracks matching their preferences.

### Layered Visual Architecture
- **Art Frame**: Swappable visual container for album/track artwork
- **Dynamic Content Windows**: Modular UI sections that update based on user interaction and filtering state

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
├── lib/              # Utility functions and client configs
│   └── supabase.ts   # Supabase client initialization
└── types/            # TypeScript type definitions
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```
