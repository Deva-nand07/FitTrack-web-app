# GymTrack 🏋️

A lightweight, frontend-only gym progress tracker PWA with streaks, custom workout plans, and charts.

## Features
- 📋 **Workout Plan Builder** — custom exercises, weekly schedule
- ✅ **Daily Workout Tracking** — check off exercises as you go
- 🔥 **Streak System** — LeetCode-style streak tracking
- 🛋️ **Rest Day Support** — mark rest days without breaking streak
- 📊 **Progress Charts** — weekly bars, monthly calendar, streak heatmap
- 📱 **PWA** — install on mobile, works offline
- 💾 **No login required** — data stored in localStorage

## Getting Started

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Zustand (state management)
- Recharts (charts)
- localStorage (data persistence)
- Vite PWA Plugin (service workers, offline support)

## How to Use

1. Go to **Plan** tab → create a workout plan with exercises and assign days of the week
2. Come back to **Today** tab to track your workout
3. Check off exercises as you complete them
4. Use **Mark as Rest Day** on off days to keep your streak alive
5. Check **Progress** tab to see charts and streak calendar
