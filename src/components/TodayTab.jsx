import React, { useState } from 'react'
import { useStore, platesToKg, kgToPlatesDisplay } from '../store'
import { CheckCircle, Circle, Coffee, Plus, Dumbbell, Timer, ChevronRight } from 'lucide-react'

const S = {
  page: { padding: '20px 16px 16px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '16px', marginBottom: 12,
    backdropFilter: 'blur(12px)',
  },
  planHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: 15, fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.2px' },
  exRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.2s',
  },
  exName: { fontSize: 14, fontWeight: 600, color: '#f0f4ff', marginBottom: 2 },
  exMeta: { fontSize: 11, color: '#8892aa' },
  restBtn: {
    width: '100%', padding: '14px', borderRadius: 14, marginTop: 8,
    background: 'rgba(96,165,250,0.1)',
    border: '1px solid rgba(96,165,250,0.25)',
    color: '#60a5fa', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
    letterSpacing: '0.03em',
  },
}

function ProgressRing({ done, total }) {
  const r = 18, c = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle cx={22} cy={22} r={r} fill="none"
        stroke={pct === 1 ? '#10b981' : '#0ea5e9'} strokeWidth={3}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '22px 22px', transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={22} y={27} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={pct === 1 ? '#10b981' : '#38bdf8'}>
        {done}/{total}
      </text>
    </svg>
  )
}

export default function TodayTab() {
  const { getTodayPlans, getTodayLog, toggleExercise, markRestDay, plans, dayName } = useStore()
  const todayPlans = getTodayPlans()
  const log = getTodayLog()
  const todayDay = dayName()
  const planRestDay = plans.some(p => (p.restDays || []).includes(todayDay))
  const [checking, setChecking] = useState({})

  const handleCheck = (planId, exId) => {
    const key = `${planId}-${exId}`
    setChecking(c => ({ ...c, [key]: true }))
    setTimeout(() => setChecking(c => { const n = { ...c }; delete n[key]; return n }), 300)
    toggleExercise(planId, exId)
  }

  if (log.rest || planRestDay) {
    return (
      <div style={S.page} className="page-enter">
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Coffee size={32} style={{ color: '#60a5fa' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f4ff', marginBottom: 8 }}>Rest Day</h2>
          <p style={{ fontSize: 13, color: '#8892aa', lineHeight: 1.6 }}>
            {planRestDay && !log.rest
              ? `${todayDay} is a scheduled rest day.`
              : 'You marked today as a rest day.'
            }<br />Streak maintained. Recovery is progress.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page} className="page-enter">
      {todayPlans.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Dumbbell size={32} style={{ color: '#0ea5e9' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', marginBottom: 8 }}>
            No workout scheduled
          </h2>
          <p style={{ fontSize: 13, color: '#8892aa' }}>
            Go to Plan tab to set up a workout for {todayDay}, or mark as rest day.
          </p>
        </div>
      ) : (
        todayPlans.map((plan) => {
          const planLog = (log[plan.id]?.exercises) || {}
          const done = plan.exercises.filter(e => planLog[e.id]).length
          const total = plan.exercises.length
          return (
            <div key={plan.id} style={S.card}>
              <div style={S.planHeader}>
                <div>
                  <p style={S.planName}>{plan.name}</p>
                  <p style={{ fontSize: 11, color: '#8892aa', marginTop: 2 }}>
                    {done === total && total > 0 ? 'Completed!' : `${total - done} exercises remaining`}
                  </p>
                </div>
                <ProgressRing done={done} total={total} />
              </div>

              {plan.exercises.map((ex) => {
                const isDone = !!planLog[ex.id]
                const key = `${plan.id}-${ex.id}`
                return (
                  <div key={ex.id} style={{
                    ...S.exRow,
                    opacity: isDone ? 0.5 : 1,
                  }}>
                    <button onClick={() => handleCheck(plan.id, ex.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                      className={checking[key] ? 'check-pop' : ''}>
                      {isDone
                        ? <CheckCircle size={24} style={{ color: '#10b981', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }} />
                        : <Circle size={24} style={{ color: '#4a5568' }} />
                      }
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...S.exName, textDecoration: isDone ? 'line-through' : 'none' }}>{ex.name}</p>
                      <p style={S.exMeta}>
                        {ex.sets} sets &times; {ex.reps} {ex.type === 'cardio' ? 'sec' : 'reps'}
                        {ex.weightMode === 'plates'
                          ? ` · ${platesToKg(ex.plates || {})}kg (${kgToPlatesDisplay(ex.plates || {})})`
                          : ex.weight ? ` · ${ex.weight}kg` : ''}
                      </p>
                    </div>
                    {ex.type === 'cardio'
                      ? <Timer size={14} style={{ color: '#8892aa', flexShrink: 0 }} />
                      : <Dumbbell size={14} style={{ color: '#8892aa', flexShrink: 0 }} />
                    }
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      <button style={S.restBtn} onClick={markRestDay}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.1)'}>
        <Coffee size={16} />
        Mark as Rest Day
      </button>
    </div>
  )
}
