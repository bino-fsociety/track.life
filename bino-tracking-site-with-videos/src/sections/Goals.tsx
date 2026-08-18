import { useState } from 'react'
import { Check, CheckCircle2, Flag, Plus, Sparkles, Target, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, Field, Input, SectionHead, Select, Stat, Textarea } from '../components/ui'
import type { Goal } from '../types'
import { clamp, localDateKey, newId } from '../utils'
import type { SectionProps } from './shared'

const categories = ['Money', 'Training', 'Work', 'Sleep', 'Business', 'Personal', 'Other']
const emptyGoal = { title: '', category: 'Personal', target: '', progress: '', deadline: '', notes: '' }

export function Goals({ data, commit }: SectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyGoal)
  const active = data.goals.filter((goal) => !goal.completed)
  const complete = data.goals.filter((goal) => goal.completed)
  const average = active.length ? active.reduce((total, goal) => total + clamp(goal.progress / Math.max(goal.target, 1) * 100, 0, 100), 0) / active.length : 0
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title || !Number(form.target) || !form.deadline) return
    const goal: Goal = { id: newId(), title: form.title.trim(), category: form.category, target: Number(form.target), progress: Number(form.progress), deadline: form.deadline, notes: form.notes.trim(), completed: Number(form.progress) >= Number(form.target), createdAt: localDateKey() }
    commit((current) => ({ ...current, goals: [...current.goals, goal] }))
    setForm(emptyGoal); setShowForm(false)
  }
  const update = (id: string, patch: Partial<Goal>) => commit((current) => ({ ...current, goals: current.goals.map((goal) => goal.id === id ? { ...goal, ...patch } : goal) }))
  const remove = (id: string) => commit((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) }))

  return <div className="page">
    <SectionHead eyebrow="Goals" title="Turn ambition into a system." action={<Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>{showForm ? 'Cancel' : <><Plus size={16} /> New goal</>}</Button>} />
    <div className="stats-grid three">
      <Stat label="Active goals" value={`${active.length}`} tone="gold" />
      <Stat label="Average progress" value={`${Math.round(average)}%`} tone="good" />
      <Stat label="Completed" value={`${complete.length}`} />
    </div>

    {showForm && <Card className="goal-form-card">
      <SectionHead eyebrow="Set a target" title="Create a new goal" action={<Target size={19} className="gold-icon" />} />
      <form className="form-stack" onSubmit={submit}>
        <div className="form-row"><Field label="Goal title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What are you aiming for?" required /></Field><Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</Select></Field></div>
        <div className="form-row three"><Field label="Target value"><Input type="number" min="0.01" step="0.01" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="100" required /></Field><Field label="Current progress"><Input type="number" min="0" step="0.01" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} placeholder="0" /></Field><Field label="Deadline"><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required /></Field></div>
        <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Why this matters, milestones, or plan…" /></Field>
        <Button type="submit"><Flag size={16} /> Create goal</Button>
      </form>
    </Card>}

    {!active.length && !showForm ? <Card><EmptyState icon={<Flag />} title="Your next chapter starts here" copy="Create a goal, define its finish line, and update it as you move." /><div className="empty-action"><Button onClick={() => setShowForm(true)}><Plus size={16} /> Create your first goal</Button></div></Card> : <div className="goals-grid">{active.map((goal) => <GoalCard key={goal.id} goal={goal} update={update} remove={remove} />)}</div>}

    {complete.length > 0 && <Card><SectionHead eyebrow="Done" title="Completed goals" action={<CheckCircle2 className="positive-text" size={20} />} /><div className="completed-list">{complete.map((goal) => <div key={goal.id}><span><Check size={15} /></span><div><strong>{goal.title}</strong><small>{goal.category}</small></div><button onClick={() => remove(goal.id)}><Trash2 size={15} /></button></div>)}</div></Card>}
  </div>
}

function GoalCard({ goal, update, remove }: { goal: Goal; update: (id: string, patch: Partial<Goal>) => void; remove: (id: string) => void }) {
  const percent = clamp(goal.progress / Math.max(goal.target, 1) * 100, 0, 100)
  return <Card className="goal-card"><div className="goal-top"><span className="goal-category">{goal.category}</span><button onClick={() => remove(goal.id)} aria-label="Delete goal"><Trash2 size={15} /></button></div><h3>{goal.title}</h3><p>{goal.notes || `Deadline: ${goal.deadline}`}</p><div className="goal-progress-head"><span>Progress</span><strong>{Math.round(percent)}%</strong></div><div className="progress-bar"><i style={{ width: `${percent}%` }} /></div><div className="goal-controls"><Field label="Current"><Input type="number" min="0" step="0.01" value={goal.progress} onChange={(event) => { const progress = Number(event.target.value); update(goal.id, { progress, completed: progress >= goal.target }) }} /></Field><span>of {goal.target}</span><Button variant="secondary" onClick={() => update(goal.id, { progress: goal.target, completed: true })}><Check size={15} /> Complete</Button></div><div className="goal-deadline"><Sparkles size={14} /> Due {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div></Card>
}
