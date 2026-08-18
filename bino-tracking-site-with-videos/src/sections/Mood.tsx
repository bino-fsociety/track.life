import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BatteryCharging, Brain, HeartPulse, Waves } from 'lucide-react'
import { Card, Field, PeriodTabs, Rating, SectionHead, Stat, Textarea } from '../components/ui'
import type { Period } from '../types'
import { getEntry, niceDate, number, parseDate, periodDates, sum } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Mood({ data, selectedDate, updateEntry }: SectionProps) {
  const [period, setPeriod] = useState<Period>('month')
  const entry = getEntry(data, selectedDate)
  const dates = periodDates(period, parseDate(selectedDate))
  const logged = dates.map((date) => getEntry(data, date)).filter((item) => item.mood.mood > 0)
  const average = (key: 'mood' | 'energy' | 'stress') => logged.length ? sum(logged.map((item) => item.mood[key])) / logged.length : 0
  const chart = dates.map((date) => {
    const mood = getEntry(data, date).mood
    return { date: niceDate(date, true), mood: mood.mood || null, energy: mood.energy || null, stress: mood.stress || null }
  })
  const setMood = <K extends keyof typeof entry.mood>(key: K, value: typeof entry.mood[K]) => updateEntry(selectedDate, (current) => ({ ...current, mood: { ...current.mood, [key]: value } }))
  const moodWords = ['Not rated', 'Very low', 'Low', 'Steady', 'Good', 'Excellent']

  return <div className="page">
    <SectionHead eyebrow="Mood tracker" title="Notice what moves you." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="stats-grid four">
      <Stat label="Today’s mood" value={moodWords[entry.mood.mood]} tone="gold" />
      <Stat label={`${period} mood`} value={average('mood') ? `${number.format(average('mood'))}/5` : '—'} />
      <Stat label={`${period} energy`} value={average('energy') ? `${number.format(average('energy'))}/5` : '—'} tone="good" />
      <Stat label={`${period} stress`} value={average('stress') ? `${number.format(average('stress'))}/5` : '—'} tone={average('stress') > 3 ? 'bad' : 'default'} />
    </div>

    <div className="two-column mood-grid">
      <Card>
        <SectionHead eyebrow={niceDate(selectedDate)} title="Daily check-in" action={<span className="round-icon violet"><HeartPulse /></span>} />
        <div className="rating-stack">
          <Field label="Mood" hint={moodWords[entry.mood.mood]}><div className="rating-line"><HeartPulse /><Rating value={entry.mood.mood} onChange={(value) => setMood('mood', value)} /></div></Field>
          <Field label="Energy" hint={entry.mood.energy ? `${entry.mood.energy} of 5` : 'not rated'}><div className="rating-line"><BatteryCharging /><Rating value={entry.mood.energy} onChange={(value) => setMood('energy', value)} /></div></Field>
          <Field label="Stress" hint={entry.mood.stress ? `${entry.mood.stress} of 5` : 'not rated'}><div className="rating-line"><Waves /><Rating value={entry.mood.stress} onChange={(value) => setMood('stress', value)} /></div></Field>
          <Field label="A short note"><Textarea rows={4} value={entry.mood.note} onChange={(event) => setMood('note', event.target.value)} placeholder="What shaped how you felt today?" /></Field>
        </div>
      </Card>
      <Card>
        <SectionHead eyebrow="Reflection" title="Emotional snapshot" action={<Brain size={18} className="muted-icon" />} />
        <div className="mood-orbit">
          <div className="mood-score"><span>Today</span><strong>{entry.mood.mood || '—'}</strong><small>/ 5 mood</small></div>
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        </div>
        <p className="center-copy">{entry.mood.note || 'No note yet. A sentence is enough to make the numbers meaningful.'}</p>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow={`${period} view`} title="Mood, energy & stress" />
      <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ left: -22, right: 7, top: 12 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
        <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} axisLine={false} tickLine={false} tick={axisStyle} />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Line connectNulls type="monotone" dataKey="mood" stroke="#c8a76a" strokeWidth={2.5} dot={false} />
        <Line connectNulls type="monotone" dataKey="energy" stroke="#70d6a2" strokeWidth={2.5} dot={false} />
        <Line connectNulls type="monotone" dataKey="stress" stroke="#d17482" strokeWidth={2} dot={false} />
      </LineChart></ResponsiveContainer></div>
      <div className="chart-legend"><span><i className="gold" />Mood</span><span><i className="green" />Energy</span><span><i className="red" />Stress</span></div>
    </Card>
  </div>
}
