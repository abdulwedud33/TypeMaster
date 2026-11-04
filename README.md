# TypeMaster – Precision Touch Typing Academy & Learning Platform

TypeMaster is a complete, production-ready touch typing education web platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Drizzle ORM**, and **Neon PostgreSQL**.

It is engineered to guide typists from absolute beginner (tactile home row anchors on F & J) to grandmaster (programming code, brackets, and high-velocity prose) through progressive structured curriculum, intelligent weak-key detection, and tactile audio feedback.

---

## 🚀 Key Features

1. **10-Level Progressive Curriculum**:
   - **Level 1**: Home Row Fundamentals (Anchor keys F & J, Left hand A S D F, Right hand J K L ;)
   - **Level 2**: Top Row Letters (Q W E R T Y U I O P integrated with home row)
   - **Level 3**: Bottom Row Letters (Z X C V B N M connecting all rows)
   - **Level 4**: All Lowercase Letters (N-grams, common words, fluid sentences)
   - **Level 5**: Capital Letters & Shift (Opposite-hand shift key discipline)
   - **Level 6**: Numbers & Dates (Top number row: 0 through 9)
   - **Level 7**: Punctuation & Special Symbols (Brackets, math, quotes, email symbols)
   - **Level 8**: Common Words & Vocabulary (High-frequency beginner, intermediate, advanced)
   - **Level 9**: Natural Sentences & Paragraphs (Natural English prose and questions)
   - **Level 10**: Advanced Typing & Code (TypeScript, brackets, camelCase, algorithms)

2. **Real-Time Reactive Typing Engine**:
   - Zero-latency physical keyboard tracking.
   - Per-finger color mapping and physical anchor dot cues on F and J.
   - Smooth animated caret and live WPM/Accuracy calculations.
   - Correct, error, and backspace handling.
   - Tactile audio feedback synthesized via Web Audio API (no external asset dependencies).

3. **Smart Weak-Key Detection**:
   - Tracks actual character mistakes and misstrikes during sessions.
   - Dynamically surfaces problematic keys with individual accuracy and error counts.
   - Auto-generates targeted drills to systematically eliminate typing bottlenecks.

4. **Personalized Dashboard & Longitudinal Analytics**:
   - Key performance indicators: Best WPM, Lifetime Accuracy, Current & Longest Streaks, Total Practice Time.
   - GitHub-style 60-day calendar activity heatmap.
   - Weekly practice volume bar charts.
   - Milestone achievement unlocks and daily practice goal tracking.

5. **Flexible Practice & Timed Tests**:
   - Practice by category: Words, Sentences, Paragraphs, Numbers, Punctuation, Code, Custom pasted text.
   - Timed tests: 15s, 30s, 60s, 2m, 5m across Beginner, Intermediate, and Advanced passages.

6. **Neon PostgreSQL & Drizzle ORM**:
   - Relational database schema for users, progress, sessions, key statistics, and achievements.
   - Built-in graceful local demo mode allowing immediate testing even before connecting Neon.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark theme default: `#0D0F14`, Card: `#171A23`, Accent: `#D4F36B`, Violet: `#8B7CFF`)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM & Drizzle Kit
- **Icons**: Lucide React
- **Audio**: Web Audio API Synthesizer

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Neon database connection URL:
```env
DATABASE_URL=postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/typemaster?sslmode=require
AUTH_SECRET=your-secret-key-at-least-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Push Database Schema & Seed Curriculum
```bash
# Push tables to Neon PostgreSQL
npm run db:push

# Seed all 10 curriculum levels and achievements
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing!

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository into your **Vercel** dashboard.
3. In the Vercel project settings, add the Environment Variables:
   - `DATABASE_URL` (From your Neon console)
   - `AUTH_SECRET` (A strong random secret)
4. Click **Deploy**.
5. Once deployed, run `npm run db:push` and `npm run db:seed` against your production Neon database URL (or use the built-in `/api/seed` endpoint).

