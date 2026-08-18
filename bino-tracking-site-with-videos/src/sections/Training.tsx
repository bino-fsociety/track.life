import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Dumbbell, Flame, Footprints, PersonStanding, Trophy } from 'lucide-react'
import { Card, Field, Input, PeriodTabs, SectionHead, Stat, Textarea, Toggle } from '../components/ui'
import type { Period } from '../types'
import { getEntry, niceDate, number, parseDate, periodDates, streak } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Training({ data, selectedDate, updateEntry }: SectionProps) {
  const [period, setPeriod] = useState<Period>('month')
  const entry = getEntry(data, selectedDate)
  const training = entry.training
  const dates = periodDates(period, parseDate(selectedDate))
  const entries = dates.map((date) => getEntry(data, date))
  const active = (item: typeof entry) => item.training.gym || item.training.pushUps + item.training.abs + item.training.walkingMinutes + item.training.runningMinutes > 0
  const activeDays = entries.filter(active).length
  const allEntries = Object.values(data.entries)
  const records = {
    pushUps: Math.max(0, ...allEntries.map((item) => item.training.pushUps)),
    abs: Math.max(0, ...allEntries.map((item) => item.training.abs)),
    walk: Math.max(0, ...allEntries.map((item) => item.training.walkingMinutes)),
    run: Math.max(0, ...allEntries.map((item) => item.training.runningMinutes)),
  }
  const currentStreak = streak(allEntries.map((item) => ({ date: item.date, active: active(item) })), selectedDate)
  const chart = dates.map((date) => {
    const item = getEntry(data, date).training
    return { date: niceDate(date, true), strength: item.pushUps + item.abs, movement: item.walkingMinutes + item.runningMinutes }
  })
  const setTraining = <K extends keyof typeof training>(key: K, value: typeof training[K]) => updateEntry(selectedDate, (current) => ({ ...current, training: { ...current.training, [key]: value } }))

  return <div className="page">
    <SectionHead eyebrow="Training tracker" title="Build a body that keeps up." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="stats-grid four">
      <Stat label="Active days" value={`${activeDays}`} note={`this ${period}`} tone="good" />
      <Stat label="Current streak" value={`${currentStreak} day${currentStreak === 1 ? '' : 's'}`} note="keep showing up" tone="gold" />
      <Stat label="Push-ups" value={number.format(training.pushUps)} note="today" />
      <Stat label="Movement" value={`${training.walkingMinutes + training.runningMinutes} min`} note="today" />
    </div>

    <div className="two-column training-layout">
      <Card>
        <SectionHead eyebrow={niceDate(selectedDate)} title="Log your session" action={<span className="round-icon positive"><Dumbbell /></span>} />
        <div className="form-stack">
          <Toggle label="Gym session completed" checked={training.gym} onChange={(value) => setTraining('gym', value)} />
          <div className="form-row">
            <Field label="Push-ups"><Input type="number" min="0" inputMode="numeric" value={training.pushUps || ''} placeholder="0" onChange={(e) => setTraining('pushUps', Number(e.target.value))} /></Field>
            <Field label="Abs"><Input type="number" min="0" inputMode="numeric" value={training.abs || ''} placeholder="0" onChange={(e) => setTraining('abs', Number(e.target.value))} /></Field>
          </div>
          <div className="form-row">
            <Field label="Walking" hint="minutes"><Input type="number" min="0" inputMode="numeric" value={training.walkingMinutes || ''} placeholder="0" onChange={(e) => setTraining('walkingMinutes', Number(e.target.value))} /></Field>
            <Field label="Running" hint="minutes"><Input type="number" min="0" inputMode="numeric" value={training.runningMinutes || ''} placeholder="0" onChange={(e) => setTraining('runningMinutes', Number(e.target.value))} /></Field>
          </div>
          <Field label="Training notes"><Textarea value={training.notes} onChange={(e) => setTraining('notes', e.target.value)} placeholder="How did the session feel?" rows={4} /></Field>
        </div>
      </Card>
      <Card>
        <SectionHead eyebrow="All-time best" title="Personal records" action={<Trophy size={19} className="gold-icon" />} />
        <div className="record-list">
          <Record icon={<Dumbbell />} label="Push-ups" value={`${records.pushUps} reps`} />
          <Record icon={<Activity />} label="Abs" value={`${records.abs} reps`} />
          <Record icon={<Footprints />} label="Walking" value={`${records.walk} min`} />
          <Record icon={<PersonStanding />} label="Running" value={`${records.run} min`} />
        </div>
        <div className="streak-banner"><Flame /><div><strong>{currentStreak ? `${currentStreak}-day momentum` : 'Start your streak'}</strong><span>{currentStreak ? 'Consistency is becoming your edge.' : 'Log any activity to begin.'}</span></div></div>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow={`${period} view`} title="Training volume" />
      <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ left: -18, right: 4, top: 12 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
        <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
        <Bar dataKey="strength" name="Reps" fill="#c8a76a" radius={[5, 5, 0, 0]} maxBarSize={22} />
        <Bar dataKey="movement" name="Movement minutes" fill="#70d6a2" radius={[5, 5, 0, 0]} maxBarSize={22} />
      </BarChart></ResponsiveContainer></div>
      <div className="chart-legend"><span><i className="gold" />Strength reps</span><span><i className="green" />Movement minutes</span></div>
    </Card>
  </div>
}

function Record({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="record"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>
}
