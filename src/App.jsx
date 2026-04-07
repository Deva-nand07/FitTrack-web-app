import React, { useState, useEffect, useRef } from 'react'
import { useStore } from './store'
import TodayTab from './components/TodayTab'
import PlanTab from './components/PlanTab'
import ProgressTab from './components/ProgressTab'
import HistoryTab from './components/HistoryTab'
import { Dumbbell, LayoutGrid, TrendingUp, Clock, Flame } from 'lucide-react'

const TABS = [
  { id: 'today', label: 'Today', Icon: Dumbbell, bg: '/bg-today.jpg' },
  { id: 'plan', label: 'Plan', Icon: LayoutGrid, bg: '/bg-history.jpg' },
  { id: 'progress', label: 'Progress', Icon: TrendingUp, bg: '/bg-progress.jpg' },
  { id: 'history', label: 'History', Icon: Clock, bg: '/bg-history.jpg' },
]

function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setTimeout(onDone, 300); return 100 }
        return p + 4
      })
    }, 40)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0e1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.4s',
      opacity: progress >= 100 ? 0 : 1,
    }}>
      {/* Background gym image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/bg-today.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.08,
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Logo with pulse rings */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
          <div className="pulse-ring" style={{
            position: 'absolute', inset: 0,
            border: '2px solid rgba(14,165,233,0.4)',
            borderRadius: '50%',
          }} />
          <div className="pulse-ring" style={{
            position: 'absolute', inset: 0,
            border: '2px solid rgba(14,165,233,0.2)',
            borderRadius: '50%',
            animationDelay: '0.5s',
          }} />
          <img src="/logo.png" alt="FitTrack"
            style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: '50%' }} />
        </div>

        {/* Brand name */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 42, fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(90deg, #e0f2fe, #0ea5e9, #14b8a6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FIT</span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 42, fontWeight: 900, letterSpacing: '-1px',
            color: '#f0f4ff',
          }}>TRACK</span>
          <p style={{ color: '#8892aa', fontSize: 13, marginTop: 4, letterSpacing: '0.1em' }}>
            TRACK · IMPROVE · DOMINATE
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0ea5e9, #14b8a6)',
            borderRadius: 2,
            transition: 'width 0.05s linear',
            boxShadow: '0 0 10px rgba(14,165,233,0.8)',
          }} />
        </div>
        <p style={{ color: '#4a5568', fontSize: 11, marginTop: 10, letterSpacing: '0.15em' }}>
          LOADING {progress}%
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('today')
  const [prevTab, setPrevTab] = useState('today')
  const { streak, recalcStreak } = useStore()
  const contentKey = useRef(0)

  useEffect(() => { recalcStreak() }, [])

  const handleTabChange = (id) => {
    if (id === tab) return
    setPrevTab(tab)
    setTab(id)
    contentKey.current++
  }

  const currentBg = TABS.find(t => t.id === tab)?.bg || '/bg-today.jpg'

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', position: 'relative' }}>
      {/* Dynamic section background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${currentBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.06,
        transition: 'background-image 0.6s ease, opacity 0.4s',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          padding: '44px 20px 12px',
          background: 'rgba(10,14,26,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* FitTrack logo text exactly matching screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #93c5fd, #0ea5e9, #14b8a6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>FIT</span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px',
                color: '#f0f4ff',
              }}>TRACK</span>
            </div>
          </div>

          {/* Streak badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 20, padding: '6px 12px',
          }}>
            <Flame size={14} style={{ color: '#f59e0b' }} className="flicker" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
              {streak.current || 0} day streak
            </span>
          </div>
        </header>

        {/* Tab content */}
        <main key={contentKey.current} className="page-enter" style={{ paddingBottom: 80 }}>
          {tab === 'today' && <TodayTab />}
          {tab === 'plan' && <PlanTab />}
          {tab === 'progress' && <ProgressTab />}
          {tab === 'history' && <HistoryTab />}
        </main>
      </div>

      {/* Bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }} className="nav-safe">
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex' }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => handleTabChange(id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 0 8px', gap: 4, border: 'none', background: 'transparent',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all 0.2s',
                }}>
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%',
                    height: 2,
                    background: 'linear-gradient(90deg, #0ea5e9, #14b8a6)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <Icon size={20} style={{
                  color: active ? '#0ea5e9' : '#4a5568',
                  filter: active ? 'drop-shadow(0 0 6px rgba(14,165,233,0.7))' : 'none',
                  transition: 'all 0.2s',
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                  color: active ? '#38bdf8' : '#4a5568',
                  transition: 'color 0.2s',
                }}>{label.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
