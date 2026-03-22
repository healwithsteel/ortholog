# OrthoLog — Native App Spec (iOS & Android)
## For Dr. Karl F. Siebuhr / UCF Orthopaedic Surgery Residency

---

## Executive Summary

A native mobile app for orthopaedic surgery residents to log surgical cases, share de-identified X-rays, collaborate on tips & tricks, and track their case volume across all subspecialties.

**No PHI.** No HIPAA requirements. No patient identifiers of any kind.

---

## Platform Strategy

### Phase 1: PWA (NOW — already built)
- Installable from any browser, works on all devices
- Zero app store friction — share a URL, residents install in 30 seconds
- $0/month hosting (Vercel free tier)
- **Timeline**: Ready now

### Phase 2: React Native App (recommended for native)
- Single codebase → iOS + Android from one repo
- **Framework**: React Native with Expo (EAS Build)
- Shares data layer & business logic with the PWA
- Native features: camera for X-ray capture, push notifications, offline support
- **Timeline**: 4-6 weeks from green light
- **Cost**: $0 dev (I build it), $99/yr Apple Developer, $25 one-time Google Play

### Why React Native over Flutter or SwiftUI+Kotlin:
1. **Shared code with PWA** — same JavaScript, same Supabase SDK, same data models
2. **Expo** handles 90% of build/deploy complexity
3. **OTA updates** — push fixes without app store review
4. **One developer** can maintain both platforms

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ PWA      │  │ iOS App  │  │ Android  │  │
│  │ (React)  │  │ (RN/Expo)│  │ (RN/Expo)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └──────────────┼──────────────┘        │
│                      │                        │
│              Shared Logic Layer               │
│       (hooks, data models, API calls)         │
└──────────────────────┬────────────────────────┘
                       │
              ┌────────┴────────┐
              │    Supabase     │
              │  ┌────────────┐ │
              │  │ PostgreSQL │ │  ← Cases, tips, users
              │  │   Auth     │ │  ← Magic link / email
              │  │  Storage   │ │  ← De-identified X-rays
              │  │  Realtime  │ │  ← Live feed updates
              │  └────────────┘ │
              └─────────────────┘
```

---

## Database Schema (Supabase/PostgreSQL)

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, from Supabase Auth |
| email | text | Unique |
| display_name | text | e.g., "Adam Daniel" |
| pgy_year | int | 1-5 |
| class_year | int | e.g., 2031 |
| program_id | uuid | FK → programs |
| role | text | 'resident' \| 'faculty' \| 'admin' |
| tier | text | 'free' \| 'pro' (default: 'free') |
| avatar_url | text | nullable |
| created_at | timestamptz | |

### `programs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g., "UCF/HCA Ocala" |
| institution | text | e.g., "University of Central Florida" |
| city | text | e.g., "Ocala" |
| state | text | e.g., "FL" |
| license_tier | text | 'free' \| 'licensed' (default: 'free') |
| license_expires | timestamptz | nullable — null = free forever |
| invite_code | text | Unique, for resident onboarding |
| pd_user_id | uuid | FK → users (Program Director) |
| custom_logo_url | text | nullable — for white-label |
| created_at | timestamptz | |

### `cases`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| date | date | Surgery date |
| cpt_code | text | e.g., "27244" |
| procedure_name | text | Auto-filled from CPT |
| category | text[] | e.g., ['trauma'] |
| body_region | text | e.g., "hip" |
| approach | text | e.g., "Direct lateral" |
| attending_name | text | Surgeon name |
| role | text | 'primary' \| 'first_assist' \| 'observer' |
| position | text | Patient positioning |
| implants | text[] | Array of implant descriptions |
| reduction_aids | text[] | Array of aids/equipment |
| notes | text | Free text — NO PHI |
| tip | text | Optional teaching pearl |
| is_shared | boolean | Visible to cohort? |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `xrays`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| case_id | uuid | FK → cases |
| storage_path | text | Supabase Storage path |
| view_type | text | 'AP' \| 'lateral' \| 'oblique' \| 'intraop' \| 'postop' |
| caption | text | Optional annotation |
| uploaded_by | uuid | FK → users |
| created_at | timestamptz | |

### `tips`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| title | text | e.g., "CMN start point" |
| body | text | Full tip content |
| category | text | 'trauma', 'recon', etc. |
| procedure_ref | text | Optional CPT or procedure name |
| tags | text[] | Searchable tags |
| likes_count | int | Denormalized count |
| created_at | timestamptz | |

### `tip_likes`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → users |
| tip_id | uuid | FK → tips |
| created_at | timestamptz | |
| | | PK: (user_id, tip_id) |

### Row Level Security (RLS)
- **Users** can read all users in their program
- **Cases** where `is_shared = true`: readable by all in program
- **Cases** where `is_shared = false`: readable only by creator
- **X-rays**: readable if parent case is readable
- **Tips**: readable by all; writable by creator only
- **Tip likes**: insertable by any user; deletable only by creator

---

## Native App Features (beyond PWA)

### 📸 Camera Integration
- **Direct X-ray capture**: Open camera → take photo of C-arm/monitor → auto-strip EXIF data → attach to case
- **Gallery picker**: Select from photo library with EXIF stripping
- **Annotation tool**: Draw arrows/circles on X-rays before sharing
- **No PHI warning**: Prompt on every upload — "Confirm this image contains no patient identifiers"

### 🔔 Push Notifications
- New tip shared by faculty or peer
- Colleague logged a case in your category of interest
- Weekly case volume summary (Sunday evening)
- Milestone alerts: "You've logged 50 trauma cases!"

### 📴 Offline Support
- Full offline case logging — syncs when back online
- Cached CPT library (always available, no connection needed)
- Queue X-ray uploads for later sync
- Critical for OR logging where hospital WiFi may be spotty

### 🔐 Authentication
- Magic link email (no passwords to forget)
- Optional biometric (Face ID / fingerprint) for quick access
- Program-level invite codes for onboarding
- Faculty accounts with elevated permissions (can pin tips, moderate content)

### 📊 Enhanced Analytics (native only)
- Interactive charts: case volume by month, category distribution, attending breakdown
- PGY-year benchmarking (anonymous: "You vs. PGY-1 average")
- Subspecialty exposure tracking: visual breakdown of trauma vs. recon vs. sports etc.
- Export to PDF for portfolio/interview prep

### 🔗 Deep Sharing
- Share a case via link (opens in app if installed, falls back to PWA)
- "Case of the Day" feature — curated by faculty
- QR code for case sharing in the OR

---

## Screens (Native)

### 1. Home / Dashboard
- Case volume stats (total, this month, trend arrow)
- Category distribution donut chart
- Recent cases feed
- "Tip of the Day" card from faculty
- Quick-log FAB button

### 2. Case Log
- Scrollable list with search & category filter pills
- Each card: procedure, CPT, attending, date, role badge, X-ray thumbnail
- Pull-to-refresh
- Swipe actions: share, edit, delete

### 3. Case Detail
- Full metadata display (same as PWA but with native transitions)
- X-ray carousel with pinch-to-zoom
- Related cases (same CPT code)
- "Log Similar" quick-duplicate button

### 4. New Case (bottom sheet modal)
- Smart CPT picker with fuzzy search
- Attending auto-complete (learns from history)
- Toggle chips for implants & reduction aids
- Camera button for X-ray capture
- Voice notes (speech-to-text for case notes — hands may be dirty post-case)

### 5. Tips & Tricks Feed
- Card-based feed with like button
- Category filter
- Full-text search
- Faculty-pinned tips at top

### 6. CPT Library
- Searchable reference (same as PWA)
- "Recent" section (your last-used codes)
- Tap to auto-populate new case form

### 7. Profile & Settings
- PGY year, program, display name
- Case volume summary
- Export data (CSV/PDF)
- Notification preferences
- Dark mode toggle

---

## Tech Stack (Native)

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| State | Zustand (lightweight, shared with PWA) |
| Backend | Supabase (same instance as PWA) |
| Auth | Supabase Auth (magic link) |
| Storage | Supabase Storage (X-ray images) |
| Charts | react-native-chart-kit or Victory Native |
| Camera | expo-camera + expo-image-picker |
| Notifications | expo-notifications + Supabase Edge Functions |
| Offline | WatermelonDB or Supabase offline cache |
| Build | EAS Build (cloud builds, no Mac needed for iOS) |
| OTA Updates | EAS Update (skip app store for JS changes) |

---

## Timeline & Milestones

| Week | Milestone |
|------|-----------|
| 1 | Supabase project setup, schema migration, RLS policies, seed data |
| 2 | Auth flow (magic link), user profiles, program invite system |
| 3 | Case CRUD — log, view, edit, search, filter |
| 4 | X-ray upload with camera, EXIF stripping, gallery viewer |
| 5 | Tips & Tricks CRUD, likes, search, faculty pins |
| 6 | Push notifications, offline support, analytics dashboard |
| 7 | Polish, testing with actual residents, bug fixes |
| 8 | App Store / Play Store submission |

**Target**: PWA live by April, native apps submitted by late May, ready for **Class of 2031 orientation (July 1, 2026)**.

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Supabase (free tier) | $0 | Monthly (up to 500MB DB, 1GB storage) |
| Supabase Pro (if needed) | $25 | Monthly |
| Apple Developer Account | $99 | Annual |
| Google Play Developer | $25 | One-time |
| Vercel (PWA hosting) | $0 | Monthly (free tier) |
| EAS Build (Expo) | $0 | Monthly (free tier: 15 builds/month) |
| **Total Year 1** | **~$124** | |
| **Total ongoing** | **~$99/yr** | (Apple renewal only) |

---

## Scalability Path

### Phase 1 — UCF/HCA Ocala (July 2026)
- 3 residents (Class of 2031) + 3 faculty
- Single program, invite-only

### Phase 2 — Full UCF Program (2027)
- All 5 PGY years (~25 residents)
- Multi-year case volume analytics
- Interview portfolio export

### Phase 3 — Multi-Program (2028+)
- Other FL ortho residencies (USF, UF, UMiami)
- Program-level isolation (each program sees only their data)
- Anonymous cross-program benchmarking
- Potential ACGME integration if they open an API

### Revenue Model — Freemium Strategy

**Core Principle**: Never charge individual residents. They're broke. Build adoption first, monetize through institutions.

#### Free Tier (all residents, forever)
- Case logging with full CPT library (120+ codes)
- Tips & Tricks feed (read, write, like)
- Basic analytics (case count, category breakdown)
- X-ray upload with EXIF stripping & PHI confirmation
- Profile & case volume summary
- UCF/HCA Ocala residents are **always free** regardless of tier

#### Pro Tier — $3-5/month (individual opt-in)
- Advanced X-ray annotation tools (arrows, circles, lines, text, freehand)
- Interactive analytics dashboards (charts, trends, attending breakdown)
- PGY-year benchmarking (anonymous: "You vs. PGY-1 average")
- Export to PDF for interview portfolio
- AI-powered case suggestions ("You haven't logged a hand case in 3 months")
- Share cases via link with rich previews
- Voice notes (speech-to-text for post-case logging)
- Dark mode (yes, people will pay for this)

#### Program License — $500-1,000/year per program
- Sold to the **program/department**, not individual residents
- Aggregate analytics dashboard for Program Director:
  - Case volume by resident, category, attending, PGY year
  - Training gap identification ("No one has logged a pelvic case this quarter")
  - Subspecialty exposure distribution
  - ACGME milestone correlation data (non-binding reference)
- Faculty accounts with elevated permissions (pin tips, moderate, feature "Case of the Day")
- Program invite system (bulk onboarding)
- Custom branding option (program logo on splash screen)
- Priority support & feature requests
- Annual data export for program review

#### Financial Projections

**Year 1 (5-10 external programs adopt)**
| Source | Low | High |
|--------|-----|------|
| Pro tier (10% of ~75 users) | $270 | $450 |
| Program licenses (5-10 × $500-1,000) | $2,500 | $10,000 |
| **Total** | **$2,770** | **$10,450** |

**Year 2 (20-40 programs)**
| Source | Low | High |
|--------|-----|------|
| Pro tier (10-15% of ~350 users) | $1,260 | $3,150 |
| Program licenses (20-40 × $500-1,000) | $10,000 | $40,000 |
| **Total** | **$11,260** | **$43,150** |

**Year 3 (50-80 programs)**
| Source | Low | High |
|--------|-----|------|
| Pro tier (10-15% of ~800 users) | $2,880 | $7,200 |
| Program licenses (50-80 × $500-1,000) | $25,000 | $80,000 |
| **Total** | **$27,880** | **$87,200** |

**Costs remain minimal**: ~$99/yr Apple + $25 Google (one-time) + $0-25/mo Supabase = under $500/yr total.

#### Long-Term Platform Play (Year 3+)
Once 50+ programs are on OrthoLog:
- **Implant company partnerships**: Sponsored educational content, implant-specific case studies (clearly labeled, non-intrusive)
- **Textbook/publisher integrations**: Link CPT codes to relevant chapters (Rockwood, Hoppenfeld)
- **CME provider partnerships**: Earn CME credit for case logging milestones
- **Conference integration**: Log cases from visiting rotations, fellowships
- **Residency recruitment**: Programs with OrthoLog can showcase their case diversity to applicants
- **Data analytics (de-identified)**: National ortho training trends, procedure volume benchmarking
- **White-label licensing**: $5,000-10,000/yr for programs wanting fully branded versions

#### Market Context
- ~5,800 orthopaedic surgery residents in the US
- ~1,160 new residents per year across ~200 programs
- No dominant case-tracking app exists (ACGME's system is mandatory but universally hated)
- **OrthoLog fills the gap**: what residents actually want to use vs. what they're forced to use

#### Why This Works
1. **Zero friction adoption**: Free = viral. Residents tell co-residents. Programs hear about it from residents.
2. **Programs have budgets**: $500-1,000/yr is a rounding error next to simulation lab costs ($50K+), cadaver labs ($10K+), and textbook stipends ($500+)
3. **Network effects**: The more users, the more tips, the more valuable the platform
4. **Karl Siebuhr becomes the guy**: The trauma surgeon who built the tool every ortho resident uses. That reputation > the revenue.

---

## What This Is NOT

- ❌ Not an ACGME case log replacement (they have their own system)
- ❌ Not an EMR or clinical documentation tool
- ❌ Not for patient communication
- ❌ Not storing any PHI, ever
- ❌ Not a billing tool

**It IS**: A personal case tracker, peer learning platform, and surgical reference tool built by an ortho trauma surgeon who knows what residents actually need.

---

*Spec prepared by Galadriel for Dr. Karl F. Siebuhr*
*March 21, 2026*
