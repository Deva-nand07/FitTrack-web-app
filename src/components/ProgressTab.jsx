import React, { useMemo } from 'react'
import { useStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Flame, Trophy, Dumbbell, TrendingUp } from 'lucide-react'

const DAYS_SHORT = ['S','M','T','W','T','F','S']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
        {d.type === 'rest' ? 'Rest day' : d.count > 0 ? `${d.count} exercises` : 'No workout'}
      </p>
    </div>
  )
}

export default function ProgressTab() {
  const { log, streak, plans, dateKey, dayName, todayKey } = useStore()

  const weekData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const offset = -6 + i
    const k = dateKey(offset)
    const dl = log[k] || {}
    const d = new Date(); d.setDate(d.getDate() + offset)
    const label = DAYS_SHORT[d.getDay()]
    if (dl.rest) return { label, count: 1, type: 'rest' }
    const count = Object.values(dl).reduce((a, v) => a + (v?.exercises ? Object.values(v.exercises).filter(Boolean).length : 0), 0)
    return { label, count, type: count > 0 ? 'workout' : 'none' }
  }), [log])

  const monthDays = useMemo(() => {
    const now = new Date()
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`
      const dl = log[k] || {}
      return { day: i+1, isToday: k===todayKey(), isRest: !!dl.rest, hasDone: Object.keys(dl).length>0 && !dl.rest }
    })
  }, [log])

  const streakDays = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const offset = -(27 - i)
    const k = dateKey(offset)
    const dl = log[k] || {}
    const d = new Date(); d.setDate(d.getDate() + offset)
    return { date: d.getDate(), isToday: offset===0, isRest: !!dl.rest, hasDone: Object.keys(dl).length>0 && !dl.rest }
  }), [log])

  const totalWorkouts = Object.values(log).filter(d => !d.rest && Object.keys(d).length > 0).length

  const stats = [
    { val: streak.current || 0, lbl: 'Current Streak', sub: 'days', Icon: Flame, color: '#f59e0b' },
    { val: streak.best || 0, lbl: 'Best Streak', sub: 'days', Icon: Trophy, color: '#0ea5e9' },
    { val: totalWorkouts, lbl: 'Total Workouts', sub: 'sessions', Icon: Dumbbell, color: '#14b8a6' },
  ]

  return (
    <div style={{ padding: '20px 16px 16px' }} className="page-enter">
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {stats.map(({ val, lbl, sub, Icon, color }) => (
          <div key={lbl} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 10px', textAlign: 'center',
            backdropFilter: 'blur(12px)',
          }}>
            <Icon size={18} style={{ color, margin: '0 auto 6px', display: 'block', filter: `drop-shadow(0 0 6px ${color}80)` }} />
            <p style={{ fontSize: 24, fontWeight: 800, color: '#f0f4ff', lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 10, color: '#8892aa', marginTop: 4, letterSpacing: '0.05em' }}>{lbl}</p>
          </div>
        ))}
      </div>

      {/* Week chart */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 12px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={14} style={{ color: '#0ea5e9' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff' }}>Last 7 Days</p>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={weekData} barCategoryGap="35%" margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a5568', fontFamily: 'Barlow' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[4,4,0,0]} minPointSize={4}>
              {weekData.map((d, i) => (
                <Cell key={i} fill={d.type==='rest' ? '#3b82f6' : d.type==='workout' ? '#0ea5e9' : 'rgba(255,255,255,0.06)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month calendar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 12 }}>This Month</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {monthDays.map(({ day, isToday, isRest, hasDone }) => (
            <div key={day} style={{
              width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600,
              background: isRest ? 'rgba(59,130,246,0.15)' : hasDone ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.03)',
              color: isRest ? '#60a5fa' : hasDone ? '#38bdf8' : '#4a5568',
              border: `1px solid ${isToday ? '#0ea5e9' : isRest ? 'rgba(59,130,246,0.2)' : hasDone ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.04)'}`,
              boxShadow: isToday ? '0 0 8px rgba(14,165,233,0.4)' : 'none',
              transition: 'all 0.2s',
            }}>
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Streak calendar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 12 }}>28-Day Streak</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {streakDays.map(({ date, isToday, isRest, hasDone }, i) => (
            <div key={i} style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
              background: isRest ? 'rgba(59,130,246,0.18)' : hasDone ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.03)',
              color: isRest ? '#60a5fa' : hasDone ? '#38bdf8' : '#2d3748',
              border: `2px solid ${isToday ? '#0ea5e9' : isRest ? 'rgba(59,130,246,0.3)' : hasDone ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.04)'}`,
              boxShadow: hasDone ? '0 0 8px rgba(14,165,233,0.25)' : 'none',
            }}>
              {date}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { color: '#0ea5e9', border: 'rgba(14,165,233,0.3)', label: 'Workout' },
            { color: '#3b82f6', border: 'rgba(59,130,246,0.3)', label: 'Rest' },
            { color: '#2d3748', border: 'rgba(255,255,255,0.04)', label: 'Missed' },
          ].map(({ color, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color + '25', border: `1px solid ${border}` }} />
              <span style={{ fontSize: 10, color: '#8892aa' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
