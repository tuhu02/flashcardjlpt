# KanjiQuiz

Platform kuis interaktif untuk belajar kanji JLPT — kelola koleksi kanji, latihan dengan 3 mode kuis, dan lacak progres belajar.

## Tech Stack

- **Next.js 16** (App Router)
- **Prisma 7** + PostgreSQL (Supabase)
- **NextAuth.js** (credentials)
- **Tailwind CSS 4**

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment (copy & edit)
cp .env.example .env

# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Test database connection
npm run db:test

# Run dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for session encryption |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:test` | Test DB connection |
| `npm run db:studio` | Open Prisma Studio |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login`, `/register` | Authentication |
| `/dashboard` | Progress overview |
| `/collections` | Manage kanji collections |
| `/quiz/setup` | Configure quiz session |
| `/stats` | Detailed statistics |
| `/settings` | Profile, import/export CSV |

## CSV Import Format

```csv
kanji,cara_baca,arti,level,kelompok
日,にち / ひ,Matahari / Hari,N5,Waktu
月,つき,Bulan,N5,Waktu
```
