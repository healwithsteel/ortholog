# OrthoLog — Orthopaedic Surgery Resident Case Tracker

A progressive web app (PWA) for orthopaedic surgery residents to log cases, track procedures, store de-identified X-rays, and share tips & tricks with peers.

**Built for:** UCF/HCA Florida Ocala Hospital Orthopaedic Surgery Residency Program
**Created by:** Dr. Karl F. Siebuhr, MD — Program Faculty

## Features

- 📋 **Case Logging** — Log procedures with CPT codes, diagnosis, approach, implants
- 🩻 **X-Ray Gallery** — Upload de-identified images with annotations (position, reduction aids)
- 👨‍⚕️ **Attending Tracker** — Record which surgeon mentored each case
- 💡 **Tips & Tricks** — Resident-driven knowledge base, shareable across the cohort
- 📊 **Dashboard** — Visual case volume by category, CPT distribution, monthly trends
- 🔗 **Shareable** — Share individual cases or collections with fellow residents

## No PHI

This app stores **zero patient health information**. All X-rays must be de-identified before upload. No patient names, MRNs, DOBs, or other identifiers.

## Tech Stack

- **Frontend:** React + Vite PWA (installable on any device)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel or Netlify (free tier)
- **Cost:** $0/month on free tiers for the expected user base
