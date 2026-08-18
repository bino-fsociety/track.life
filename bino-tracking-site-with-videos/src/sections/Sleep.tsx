import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MoonStar, Sparkles } from 'lucide-react'
import { Card, Field, Input, PeriodTabs, Rating, SectionHead, Stat, Textarea } from '../components/ui'
import type { Period } from '../types'
import { getEntry, niceDate, number, parseDate, periodDates, sum } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Sleep({ data, selectedDate, updateEntry }: SectionProps) {
  const [period, setPeriod] = useState<Period>('month')
  const entry = getEntry(data, selectedDate)
  const dates = periodDates(period, parseDate(selectedDate))
  const logged = dates.map((date) => getEntry(data, date)).filter((item) => item.sleep.hours > 0)
  const average = logged.length ? sum(logged.map((item) => item.sleep.hours)) / logged.length : 0
  const quality = logged.length ? sum(logged.map((item) => item.sleep.quality)) / logged.length : 0
  const week = periodDates('week', parseDate(selectedDate)).map((date) => getEntry(data, date)).filter((item) => item.sleep.hours)
  const month = periodDates('month', parseDate(selectedDate)).map((date) => getEntry(data, date)).filter((item) => item.sleep.hours)
  const averageFor = (items: typeof logged) => items.length ? sum(items.map((item) => item.sleep.hours)) / items.length : 0
  const chart = dates.map((date) => ({ date: niceDate(date, true), hours: getEntry(data, date).sleep.hours || null, quality: getEntry(data, date).sleep.quality || null }))
  const setSleep = <K extends keyof typeof entry.sleep>(key: K, value: typeof entry.sleep[K]) => updateEntry(selectedDate, (current) => ({ ...current, sleep: { ...current.sleep, [key]: value } }))

  return <div className="page">
    <SectionHead eyebrow="Sleep tracker" title="Recovery is part of the work." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="stats-grid four">
      <Stat label="Selected day" value={entry.sleep.hours ? `${number.format(entry.sleep.hours)}h` : '—'} tone="gold" />
      <Stat label="Weekly average" value={week.length ? `${number.format(averageFor(week))}h` : '—'} />
      <Stat label="Monthly average" value={month.length ? `${number.format(averageFor(month))}h` : '—'} />
      <Stat label="Quality average" value={quality ? `${number.format(quality)}/5` : '—'} tone="good" />
    </div>

    <div className="two-column sleep-grid">
      <Card>
        <SectionHead eyebrow={niceDate(selectedDate)} title="Log your rest" action={<span className="round-icon blue"><MoonStar /></span>} />
        <div className="form-stack">
          <Field label="Sleep duration" hint="hours"><div className="hero-input"><Input type="number" min="0" max="24" step="0.25" inputMode="decimal" value={entry.sleep.hours || ''} placeholder="0" onChange={(event) => setSleep('hours', Number(event.target.value))} /><span>hours</span></div></Field>
          <Field label="Sleep quality" hint={entry.sleep.quality ? `${entry.sleep.quality} of 5` : 'not rated'}><Rating value={entry.sleep.quality} onChange={(value) => setSleep('quality', value)} labels={['Poor', 'Restless', 'Okay', 'Good', 'Excellent']} /></Field>
          <Field label="Notes"><Textarea rows={4} value={entry.sleep.notes} onChange={(event) => setSleep('notes', event.target.value)} placeholder="Bedtime, wake-ups, dreams, how you feel…" /></Field>
        </div>
      </Card>
      <Card className="sleep-insight">
        <span className="insight-icon"><Sparkles /></span>
        <p className="eyebrow">Your recovery</p>
        <h3>{average >= 7 ? 'A strong foundation.' : average ? 'A little more room to recharge.' : 'Your pattern will appear here.'}</h3>
        <p>{average ? `You are averaging ${number.format(average)} hours across ${logged.length} logged night${logged.length === 1 ? '' : 's'} this ${period}.` : 'Log a few nights and Bino Tracking App will reveal your sleep rhythm.'}</p>
        <div className="sleep-target"><span>Recommended target</span><strong>7–9 hours</strong><div><i style={{ width: `${Math.min(100, average / 9 * 100)}%` }} /></div></div>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow={`${period} view`} title="Sleep duration" />
      <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -15, right: 5, top: 12 }}>
        <defs><linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#758bd5" stopOpacity=".4"/><stop offset="1" stopColor="#758bd5" stopOpacity="0"/></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
        <YAxis domain={[0, 12]} axisLine={false} tickLine={false} tick={axisStyle} unit="h" />
        <Tooltip contentStyle={chartTooltipStyle} />
        <ReferenceLine y={8} stroke="rgba(200,167,106,.5)" strokeDasharray="4 5" />
        <Area connectNulls type="monotone" dataKey="hours" stroke="#758bd5" strokeWidth={2.5} fill="url(#sleepFill)" />
      </AreaChart></ResponsiveContainer></div>
    </Card>
  </div>
}
