import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Generate or retrieve a unique device ID so each device has its own data
function getDeviceId() {
  let id = localStorage.getItem('gymtrack-device-id')
  if (!id) {
    id = 'device-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('gymtrack-device-id', id)
  }
  return id
}

// Standard barbell plate sizes (kg)
export const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25]
export const BAR_WEIGHT = 20 // standard Olympic bar

// Calculate total weight from plates config: { "25": 2, "10": 1 } = 2×25 + 1×10 per side + bar
export function platesToKg(plates) {
  const perSide = Object.entries(plates || {}).reduce(
    (sum, [kg, count]) => sum + parseFloat(kg) * count, 0
  )
  return BAR_WEIGHT + perSide * 2
}

export function kgToPlatesDisplay(plates) {
  if (!plates || Object.keys(plates).length === 0) return 'Bar only'
  const parts = PLATE_SIZES
    .filter(p => plates[p] > 0)
    .map(p => `${plates[p]}×${p}kg`)
  return parts.join(' + ') + ' / side'
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayName(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return DAYS[d.getDay()]
}

export const useStore = create(
  persist(
    (set, get) => ({
      plans: [],
      log: {},
      streak: { current: 0, best: 0 },

      addPlan: (plan) => set((s) => ({ plans: [...s.plans, { ...plan, id: 'plan' + Date.now() }] })),

      updatePlan: (id, plan) =>
        set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...plan, id } : p)) })),

      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),

      toggleExercise: (planId, exId) => {
        const today = todayKey()
        set((s) => {
          const log = { ...s.log }
          if (!log[today]) log[today] = {}
          if (!log[today][planId]) log[today][planId] = { exercises: {} }
          if (!log[today][planId].exercises) log[today][planId].exercises = {}
          log[today][planId].exercises[exId] = !log[today][planId].exercises[exId]
          return { log }
        })
        get().recalcStreak()
      },

      markRestDay: () => {
        const today = todayKey()
        set((s) => ({ log: { ...s.log, [today]: { rest: true } } }))
        get().recalcStreak()
      },

      recalcStreak: () => {
        const { plans, log } = get()
        let cur = 0
        const best = get().streak.best || 0
        for (let i = 0; i < 365; i++) {
          const k = dateKey(-i)
          const dayLog = log[k]
          if (!dayLog) break
          if (dayLog.rest) { cur++; continue }
          const todayPlans = plans.filter((p) => p.days && p.days.includes(dayName(-i)))
          if (todayPlans.length === 0) { cur++; continue }
          const allDone = todayPlans.every((p) => {
            const exDone = (dayLog[p.id] && dayLog[p.id].exercises) || {}
            return p.exercises.every((e) => exDone[e.id])
          })
          if (allDone) cur++
          else break
        }
        set({ streak: { current: cur, best: Math.max(cur, best) } })
      },

      getTodayLog: () => get().log[todayKey()] || {},
      getTodayPlans: () => {
        const today = dayName()
        return get().plans.filter((p) => p.days && p.days.includes(today))
      },
      getTodayRestPlans: () => {
        const today = dayName()
        return get().plans.filter((p) => p.restDays && p.restDays.includes(today))
      },
      dateKey,
      dayName,
      todayKey,
    }),
    { name: `gymtrack-storage-${getDeviceId()}` }
  )
)
