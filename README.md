# SkilLoop Frontend

> A peer-to-peer skill exchange platform where users trade what they know for what they need. Your skills are your currency.

SkilLoop connects people who want to learn with people who can teach through 15-minute live video sessions — no money involved. This repository contains the full frontend application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

---

## Project Overview

SkilLoop is built for African talent to exchange skills without spending money. A user signs up, lists skills they can teach, defines what they want to learn, and gets matched with peers. When both sides agree, a 15-minute live video session is scheduled inside the browser.

The platform includes a full user-facing app (browse matches, request sessions, join live calls, manage profiles, track points) and a complete admin portal (user management, session oversight, feedback review, skill catalog management, analytics dashboard).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-vega) |
| State Management | Zustand with persist middleware |
| Animations | Framer Motion |
| Icons | Lucide React + React Icons |
| Charts | Recharts |
| Video Calls | Jitsi Meet (`@jitsi/react-sdk`) |
| Auth | Supabase Auth (Email/Password + Google OAuth) |
| Backend API | Express.js on Render (`skillloop-api.onrender.com`) |

---

## Problems Solved

### 1. Skill Discovery Was Broken
**Problem:** Users had no structured way to find peers with complementary skills. Manual outreach and social media DMs made matching slow and unreliable.

**Solution:** Built a searchable, filterable explore page (`/explore`) that pulls user matches from the API. Each match card shows what someone teaches, what they're learning, and a star rating. One-tap session requests.

### 2. Scheduling Live Sessions Was Painful
**Problem:** Coordinating meeting times between two strangers required back-and-forth messaging and external calendar links.

**Solution:** Integrated provider availability directly into the request flow. The requester picks a day and time slot from the provider's defined schedule, and the room is resolved when the session starts. Both participants land in the same room without copy-pasting links.

### 3. No In-Browser Meeting Experience
**Problem:** Requiring users to install a desktop app to join sessions created friction, especially on mobile and in restricted environments.

**Solution:** Embedded Jitsi Meet directly in `/sessions/[id]/video`. Users join meetings in the browser without installing anything, and both participants derive the same room from the session id.

### 4. Meeting Details Were Unavailable to Participants
**Problem:** After a session was scheduled, some participants had no access to the meeting link or role, so they could not join reliably.

**Solution:** The session room resolves its launch configuration through the unified `GET /sessions/:id/launch` endpoint, falling back to a locally-derived Jitsi room while that endpoint is being finalised.

### 5. Hosts and Attendees Needed Different Roles
**Problem:** Hosting and attending a session require different capabilities inside the meeting.

**Solution:** The room receives an `isHost` flag derived from the request role, so the launch response can grant the correct Jitsi role (HOST vs ATTENDEE) to each participant.

### 6. Session Completion and Feedback Were Missing
**Problem:** The flow ended when a call finished, with no way to record that the session happened or collect feedback.

**Solution:** Built session completion and a star-rating feedback form into the session room, backed by `PATCH /sessions/:id/complete` and `POST /sessions/:id/feedback`.

### 7. Completed Sessions Appeared in Upcoming Tab
**Problem:** The frontend keyed tab visibility on request status (`ACCEPTED`, `PENDING`, etc.), but marking a session complete only changes the session status — not the request status. Completed sessions were stuck in "Upcoming".

**Solution:** Updated the Upcoming filter to exclude requests where `session.status === "completed"`. The Completed tab now includes sessions with `session.status === "completed"` regardless of request status.

### 8. Web SDK Script Loading Failed
**Problem:** The code hardcoded Zoom CDN path `2.18.0` which no longer exists (returns 403). The actual SDK version is 6.2.0 with different file paths.

**Solution:** Updated `ZoomMtg.setZoomJSLib()` to point to `https://source.zoom.us/6.2.0/lib` with the correct vendor path structure. Verified all 7 SDK assets (vendor JS + WASM) return 200.

### 9. Admin Had No Technical Skill Management
**Problem:** The backend exposed `POST /admin/technical-skills`, `PUT`, and `DELETE` endpoints, but there was no frontend UI to manage the skill catalog.

**Solution:** Built a complete technical skills management section in the admin skills page with a list modal (search, refresh, edit, delete) and a create/edit form modal. Created a dedicated Zustand store for CRUD operations.

---

## Features Implemented

### User-Facing

| Feature | Route | Description |
|---|---|---|
| Waitlist Landing | `/` | Email signup, animated modal, social links |
| Marketing Page | `/landing` | Full animated landing with hero, stats, how-it-works |
| Sign Up | `/signup` | Email/password registration with validation |
| Sign In | `/signin` | Email/password login, Google OAuth |
| Profile Onboarding | `/signup/profile/*` | 3-step flow: teach skills, learn goals, availability |
| Dashboard | `/home` | Greeting, stats, upcoming sessions, pending requests |
| Activity History | `/home/history` | Points earned, session history, pagination |
| Explore Matches | `/explore` | Search/filter matches, view profiles |
| Request Session | `/explore/request` | Pick skill, date, time slot, send message |
| Sessions | `/sessions` | Tabbed view: Upcoming, Pending, Completed, Canceled |
| Live Meeting | `/sessions/[id]/video` | In-browser Jitsi Meet, host/attendee roles |
| Projects | `/projects` | Browse, join, workspace, completed projects |
| Profile | `/profile` | View, edit, preview, view others |
| Feedback | (modal) | Star rating + comment after session completion |

### Admin Portal

| Feature | Route | Description |
|---|---|---|
| Dashboard | `/admin` | Metrics, charts, user growth, top categories |
| User Management | `/admin/users` | List, detail, create, delete, role changes |
| Session Management | `/admin/sessions` | List with filters, detail view |
| Request Management | `/admin/requests` | List with filters, detail view |
| Feedback Management | `/admin/feedback` | List, detail view |
| Skill Listings | `/admin/skills` | List, delete, plus technical skill CRUD |
| Technical Skills | `/admin/skills` | Create, update, delete from skills catalog |
| Projects | `/admin/projects` | List, create, detail view |
| Settings | `/admin/settings` | Platform configuration |

---

## Results Achieved

- **Zero-install video meetings** — Users join Jitsi Meet calls in the browser, removing the desktop app dependency.
- **End-to-end session lifecycle** — From discovery to scheduling to live call to feedback, the entire flow works without leaving the platform.
- **Role-aware video integration** — Hosts and attendees receive the correct Jitsi role for their session.
- **Real-time session status** — Tabs sync correctly with backend session status. Completed sessions move to the right tab immediately.
- **Full admin control** — Admins can manage users, sessions, requests, feedback, skill listings, and the technical skills catalog through a responsive dashboard.
- **Type-safe codebase** — Strict TypeScript across all 40+ pages and 13 Zustand stores. `npx tsc --noEmit` passes cleanly.
- **Responsive design** — Mobile-first layouts with sidebar nav on desktop and bottom tab bar on mobile. Every page works on both.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://skillloop-api.onrender.com/api/v1/
```

### Install and Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
SkillLoop_frontend/
├── app/
│   ├── page.tsx              # Waitlist landing
│   ├── landing/              # Marketing page
│   ├── signin/               # Sign in
│   ├── signup/               # Sign up + onboarding steps
│   ├── auth/callback/        # OAuth callback
│   ├── home/                 # Dashboard + history
│   ├── explore/              # Match discovery + session requests
│   ├── sessions/             # Session tabs + live video room
│   ├── projects/             # Projects browse/workspace/completed
│   ├── profile/              # Profile view/edit/preview
│   └── admin/                # Full admin portal
│       ├── page.tsx          # Dashboard
│       ├── users/            # User management
│       ├── skills/           # Skill + technical skill management
│       ├── sessions/         # Session management
│       ├── requests/         # Request management
│       ├── feedback/         # Feedback management
│       ├── projects/         # Project management
│       └── settings/         # Settings
├── components/
│   ├── SideNav.tsx           # User sidebar navigation
│   ├── BottomNav.tsx         # Mobile bottom tab bar
│   ├── AdminSideNav.tsx      # Admin sidebar navigation
│   └── AdminHeader.tsx       # Admin page header
├── lib/
│   ├── authStore.ts          # User authentication
│   ├── profileStore.ts       # Profile + matching
│   ├── requestStore.ts       # Requests + session video launch
│   ├── skillsStore.ts        # Skills catalog
│   ├── adminAuthStore.ts     # Admin authentication
│   ├── adminMetricsStore.ts  # Admin analytics
│   ├── adminUserStore.ts     # Admin user CRUD
│   ├── adminSessionStore.ts  # Admin session management
│   ├── adminRequestStore.ts  # Admin request management
│   ├── adminFeedbackStore.ts # Admin feedback management
│   ├── adminSkillsStore.ts   # Admin skill listings
│   ├── adminTechnicalSkillsStore.ts  # Admin tech skills CRUD
│   └── utils.ts              # cn() helper, password validation
├── public/images/            # Brand assets, avatars
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key Technical Decisions

- **Zustand over Context** — 13 stores with `persist` for auth. Avoids deep provider trees and works naturally with Next.js App Router client components.
- **App Router exclusively** — All pages use `"use client"` with client-side data fetching via stores. Server components used only for layouts.
- **Embedded video** — Jitsi Meet is mounted client-side through `@jitsi/react-sdk`, keeping meeting logic out of the server render path.
- **API base via env var** — `NEXT_PUBLIC_API_URL` lets the same code run against local, staging, or production backends without changes.
- **Role-aware UI** — Session actions and data visibility all adapt based on whether the current user is the provider or requester.

---

## License

Copyright (c) 2026 SkilLoop, Inc. All rights reserved.
