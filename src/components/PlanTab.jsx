import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore, PLATE_SIZES, BAR_WEIGHT, platesToKg, kgToPlatesDisplay } from '../store'
import { Plus, Pencil, Trash2, Dumbbell, X, Coffee, CheckCircle } from 'lucide-react'

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const cs = {
  input: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    borderRadius: 10, fontFamily: 'Barlow, sans-serif',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0f4ff',
    outline: 'none',
  },
  label: {
    fontSize: 11, fontWeight: 600, color: '#8892aa',
    letterSpacing: '0.08em', display: 'block', marginBottom: 6,
  },
  sectionGap: { marginBottom: 20 },
}

/* ── Plate Picker ── */
function PlatePicker({ plates, onChange }) {
  const total = platesToKg(plates)
  const handle = (size, delta) => {
    const next = Math.max(0, (plates[size] || 0) + delta)
    onChange({ ...plates, [size]: next })
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#8892aa', letterSpacing: '0.08em' }}>PLATES PER SIDE</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#0ea5e9',
          background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
          padding: '2px 8px', borderRadius: 10,
        }}>Total: {total}kg</span>
      </div>
      <p style={{ fontSize: 11, color: '#4a5568', marginBottom: 10 }}>Bar ({BAR_WEIGHT}kg) + plates × 2 sides</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {PLATE_SIZES.map(size => (
          <div key={size} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '7px 10px',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8892aa', minWidth: 44 }}>{size}kg</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => handle(size, -1)} style={{
                width: 26, height: 26, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#8892aa', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', minWidth: 18, textAlign: 'center' }}>
                {plates[size] || 0}
              </span>
              <button type="button" onClick={() => handle(size, 1)} style={{
                width: 26, height: 26, borderRadius: '50%',
                border: '1px solid rgba(14,165,233,0.3)',
                background: 'rgba(14,165,233,0.1)',
                color: '#38bdf8', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Exercise Row ── */
function ExerciseRow({ ex, onChange, onRemove }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: 14, marginBottom: 10,
    }}>
      {/* Name + Type */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          style={{ ...cs.input, flex: 2 }}
          placeholder="Exercise name"
          value={ex.name}
          onChange={e => onChange('name', e.target.value)}
        />
        <select
          style={{ ...cs.input, flex: 1 }}
          value={ex.type}
          onChange={e => onChange('type', e.target.value)}
        >
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
        </select>
      </div>

      {/* Sets + Reps + Remove */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={cs.label}>Sets</label>
          <input type="number" min="1" style={cs.input}
            value={ex.sets} onChange={e => onChange('sets', parseInt(e.target.value) || 1)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={cs.label}>{ex.type === 'cardio' ? 'Minutes' : 'Reps'}</label>
          <input type="number" min="1" style={cs.input}
            value={ex.reps} onChange={e => onChange('reps', parseInt(e.target.value) || 1)} />
        </div>
        <button type="button" onClick={onRemove} style={{
          marginTop: 20, padding: '10px 10px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, color: '#f87171', cursor: 'pointer',
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}>
          <X size={14} />
        </button>
      </div>

      {/* Weight mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#8892aa' }}>Weight:</span>
        {['kg', 'plates'].map(mode => {
          const active = mode === 'plates' ? ex.weightMode === 'plates' : ex.weightMode !== 'plates'
          return (
            <button key={mode} type="button" onClick={() => onChange('weightMode', mode)} style={{
              fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${active ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: active ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
              color: active ? '#38bdf8' : '#8892aa',
              transition: 'all 0.15s',
            }}>
              {mode === 'plates' ? 'Plates' : 'kg'}
            </button>
          )
        })}
      </div>

      {ex.weightMode === 'plates'
        ? <PlatePicker plates={ex.plates || {}} onChange={p => onChange('plates', p)} />
        : (
          <div>
            <label style={cs.label}>Weight (kg) — optional</label>
            <input type="number" min="0" placeholder="e.g. 60" style={cs.input}
              value={ex.weight || ''} onChange={e => onChange('weight', e.target.value)} />
          </div>
        )
      }
    </div>
  )
}

/* ── Plan Modal — rendered via Portal so it's never clipped ── */
function PlanModal({ plan, onClose }) {
  const { addPlan, updatePlan } = useStore()
  const [name, setName] = useState(plan?.name ?? '')
  const [days, setDays] = useState(plan?.days ?? [])
  const [restDays, setRestDays] = useState(plan?.restDays ?? [])
  const [exercises, setExercises] = useState(
    plan?.exercises ?? [{
      id: 'ex' + Date.now(), name: '', type: 'strength',
      sets: 3, reps: 10, weight: '', weightMode: 'kg', plates: {},
    }]
  )

  const toggleDay = day => {
    setRestDays(r => r.filter(d => d !== day))
    setDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day])
  }
  const toggleRestDay = day => {
    setDays(d => d.filter(x => x !== day))
    setRestDays(r => r.includes(day) ? r.filter(x => x !== day) : [...r, day])
  }
  const addExercise = () => setExercises(e => [
    ...e,
    { id: 'ex' + Date.now(), name: '', type: 'strength', sets: 3, reps: 10, weight: '', weightMode: 'kg', plates: {} },
  ])
  const updateEx = (id, field, value) =>
    setExercises(e => e.map(ex => ex.id === id ? { ...ex, [field]: value } : ex))

  const save = () => {
    if (!name.trim()) return alert('Enter a plan name')
    const hasWorkoutDays = days.length > 0
    const validEx = exercises.filter(e => e.name.trim())
    if (hasWorkoutDays && !validEx.length) return alert('Add at least one exercise for workout days')
    plan ? updatePlan(plan.id, { name: name.trim(), days, restDays, exercises: validEx })
          : addPlan({ name: name.trim(), days, restDays, exercises: validEx })
    onClose()
  }

  const modalContent = (
    /* Full-screen backdrop — fixed, covers everything */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '92dvh',
          overflowY: 'auto',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: 'none',
          borderRadius: '22px 22px 0 0',
          padding: '20px 20px 40px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f0f4ff' }}>
            {plan ? 'Edit Plan' : 'New Plan'}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: 8, cursor: 'pointer',
            color: '#8892aa', display: 'flex', alignItems: 'center',
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Plan name */}
        <div style={cs.sectionGap}>
          <label style={cs.label}>Plan Name</label>
          <input
            style={cs.input}
            placeholder="e.g. Push Day, Leg Day..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Day scheduler */}
        <div style={cs.sectionGap}>
          <label style={cs.label}>Schedule Days</label>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 16,
          }}>
            {/* Workout row */}
            <p style={{ fontSize: 11, color: '#8892aa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dumbbell size={12} style={{ color: '#0ea5e9' }} /> Workout days
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 16 }}>
              {ALL_DAYS.map(d => {
                const on = days.includes(d)
                return (
                  <div key={d} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 9, color: '#4a5568', fontWeight: 600, marginBottom: 5 }}>{d.slice(0,1)}</p>
                    <button type="button" onClick={() => toggleDay(d)} style={{
                      width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                      border: `2px solid ${on ? '#0ea5e9' : 'rgba(255,255,255,0.1)'}`,
                      background: on ? 'rgba(14,165,233,0.2)' : 'transparent',
                      color: on ? '#38bdf8' : '#4a5568',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      boxShadow: on ? '0 0 10px rgba(14,165,233,0.35)' : 'none',
                    }}>
                      {on ? <CheckCircle size={15} /> : <span style={{ fontSize: 9, fontWeight: 700 }}>{d.slice(0,1)}</span>}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Rest row */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
              <p style={{ fontSize: 11, color: '#8892aa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Coffee size={12} style={{ color: '#60a5fa' }} /> Rest days
                <span style={{ color: '#4a5568', fontSize: 10 }}>(streak safe)</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {ALL_DAYS.map(d => {
                  const isRest = restDays.includes(d)
                  const isWorkout = days.includes(d)
                  return (
                    <div key={d} style={{ textAlign: 'center' }}>
                      <button type="button" onClick={() => !isWorkout && toggleRestDay(d)}
                        disabled={isWorkout}
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          cursor: isWorkout ? 'not-allowed' : 'pointer',
                          border: `2px solid ${isRest ? '#60a5fa' : 'rgba(255,255,255,0.08)'}`,
                          background: isRest ? 'rgba(96,165,250,0.15)' : 'transparent',
                          color: isRest ? '#60a5fa' : '#4a5568',
                          opacity: isWorkout ? 0.2 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                        {isRest ? <Coffee size={14} /> : <span style={{ fontSize: 9, fontWeight: 700 }}>{d.slice(0,1)}</span>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { bg: 'rgba(14,165,233,0.2)', border: '#0ea5e9', label: 'Workout' },
                { bg: 'rgba(96,165,250,0.15)', border: '#60a5fa', label: 'Rest' },
                { bg: 'transparent', border: 'rgba(255,255,255,0.1)', label: 'Off' },
              ].map(({ bg, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: bg, border: `2px solid ${border}` }} />
                  <span style={{ fontSize: 10, color: '#8892aa' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div style={cs.sectionGap}>
          <label style={cs.label}>
            EXERCISES{' '}
            {days.length === 0 && (
              <span style={{ color: '#4a5568', fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                — optional (no workout days set)
              </span>
            )}
          </label>
          {exercises.map(ex => (
            <ExerciseRow
              key={ex.id} ex={ex}
              onChange={(f, v) => updateEx(ex.id, f, v)}
              onRemove={() => setExercises(e => e.filter(x => x.id !== ex.id))}
            />
          ))}
          <button type="button" onClick={addExercise} style={{
            width: '100%', padding: '12px',
            border: '1px dashed rgba(14,165,233,0.25)',
            background: 'rgba(14,165,233,0.04)',
            borderRadius: 12, color: '#0ea5e9',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 0.2s',
          }}>
            <Plus size={15} /> Add Exercise
          </button>
        </div>

        {/* Save */}
        <button type="button" onClick={save} style={{
          width: '100%', padding: '15px',
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
          border: 'none', borderRadius: 14, color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.03em',
          boxShadow: '0 4px 24px rgba(14,165,233,0.4)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(14,165,233,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(14,165,233,0.4)' }}
        >
          Save Plan
        </button>
      </div>
    </div>
  )

  // Render via portal so it's a direct child of <body>, never clipped by any parent
  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root'))
}

/* ── Plan List ── */
export default function PlanTab() {
  const { plans, deletePlan } = useStore()
  const [modal, setModal] = useState(null)

  return (
    <div style={{ padding: '20px 16px 16px' }} className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff' }}>Workout Plans</h2>
        <button onClick={() => setModal('new')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
          border: 'none', borderRadius: 12, padding: '9px 16px',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 14px rgba(14,165,233,0.35)',
          letterSpacing: '0.03em', transition: 'all 0.2s',
        }}>
          <Plus size={14} /> New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 20px', color: '#4a5568' }}>
          <Dumbbell size={40} style={{ margin: '0 auto 14px', color: '#1e293b', display: 'block' }} />
          <p style={{ fontSize: 14, color: '#8892aa' }}>No plans yet.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Create your first workout plan.</p>
        </div>
      ) : (
        plans.map(plan => (
          <div key={plan.id} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 16, marginBottom: 12,
            backdropFilter: 'blur(12px)', transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff' }}>{plan.name}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setModal(plan)} style={{
                  padding: '5px 11px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#8892aa', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Pencil size={11} /> Edit
                </button>
                <button onClick={() => deletePlan(plan.id)} style={{
                  padding: '5px 11px', borderRadius: 8,
                  border: '1px solid rgba(239,68,68,0.22)',
                  background: 'rgba(239,68,68,0.07)',
                  color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Trash2 size={11} /> Del
                </button>
              </div>
            </div>

            {(plan.days || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
                {plan.days.map(d => <span key={d} className="chip chip-cyan">{d}</span>)}
              </div>
            )}
            {(plan.restDays || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                {plan.restDays.map(d => <span key={d} className="chip chip-blue">{d} rest</span>)}
              </div>
            )}

            {plan.exercises?.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 6 }}>
                {plan.exercises.map(e => (
                  <div key={e.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{e.name}</span>
                    <span style={{ fontSize: 11, color: '#4a5568' }}>·</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{e.sets}×{e.reps}</span>
                    {e.weightMode === 'plates'
                      ? <span style={{ fontSize: 11, color: '#0ea5e9' }}>{platesToKg(e.plates)}kg</span>
                      : e.weight ? <span style={{ fontSize: 11, color: '#64748b' }}>{e.weight}kg</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {modal && (
        <PlanModal
          plan={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
