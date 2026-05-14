# Jobby

Jobby is a production-style AI hiring intelligence platform built with Next.js App Router, Clerk auth, Prisma/PostgreSQL, UploadThing storage, deterministic NLP scoring, and OpenRouter free-model reasoning.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- shadcn-style UI primitives + lucide-react + recharts
- Clerk authentication
- Prisma ORM + PostgreSQL (Neon/Supabase compatible)
- UploadThing storage for resume files
- OpenRouter (`openrouter/free`)
- NLP libraries: `natural`, `compromise`, `pdf-parse`, `mammoth`

## Features

- **Detailed Analysis & Reasoning:** [See System Design & Logic](./SYSTEM_DESIGN.md)
- Secure sign-up/sign-in/sign-out and protected dashboard routes
- Profile system (name, skills, education, experience, preferred roles)
- Resume library with PDF/DOCX upload, extracted text persistence, and default resume
- One-click quick analysis using default resume
- Deterministic ATS scoring + interview probability + scam/ghost risk heuristics
- OpenRouter AI reasoning and optimized resume generation
- Analysis history with trend charts and explainability panel
- Export analysis report JSON and copy/download optimized output

## Required Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `UPLOADTHING_TOKEN`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (default: `openrouter/free`)

## Setup

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev
```

Open `http://localhost:3000`.

## Clerk Webhook Setup

1. In Clerk Dashboard, add an endpoint:
   - Local: `http://localhost:3000/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
2. Subscribe to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
3. Copy the endpoint signing secret (`whsec_...`) into `CLERK_WEBHOOK_SIGNING_SECRET`.

## Prisma Models

- `User`
- `Resume`
- `Analysis`
- `OptimizedResume`
- `AiRequestLog` (AI rate limiting window tracking)

## Notes

- The core scoring pipeline is deterministic first (TF-IDF/keyword overlap/similarity/rule-based risk), then AI adds explanation and resume optimization.
- UploadThing handles secure storage; extracted text and all scores are stored in PostgreSQL.
