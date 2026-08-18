import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, Clock3, Timer, TrendingUp } from 'lucide-react'
import { Card, Field, Input, PeriodTabs, SectionHead, Stat } from '../components/ui'
import type { Period } from '../types'
import { getEntry, localDateKey, niceDate, number, parseDate, periodDates, rollingDates, sum } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Work({ data, selectedDate, updateEntry }: SectionProps) {
  const [period, setPeriod] = useState<Period>('month')
  const entry = getEntry(data, selectedDate)
  const selected = parseDate(selectedDate)
  const week = periodDates('week', selected)
  const month = periodDates('month', selected)
  const year = periodDates('year', selected)
  const total = (dates: string[]) => sum(dates.map((date) => getEntry(data, date).workHours))
  const chartDates = periodDates(period, selected)
  const chart = chartDates.map((date) => ({ date: niceDate(date, true), hours: getEntry(data, date).workHours }))

  return <div className="page">
    <SectionHead eyebrow="Work tracker" title="See your effort compound." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="stats-grid four">
      <Stat label="Today" value={`${number.format(entry.workHours)}h`} tone="gold" />
      <Stat label="This week" value={`${number.format(total(week))}h`} />
      <Stat label="This month" value={`${number.format(total(month))}h`} />
      <Stat label="This year" value={`${number.format(total(year))}h`} tone="good" />
    </div>

    <div className="work-top-grid">
      <Card className="work-log-card">
        <SectionHead eyebrow={niceDate(selectedDate)} title="Deep work logged" action={<span className="round-icon gold"><Timer /></span>} />
        <Field label="Hours worked" hint="freelance + business">
          <div className="hero-input"><Input type="number" min="0" max="24" step="0.25" inputMode="decimal" value={entry.workHours || ''} placeholder="0" onChange={(event) => updateEntry(selectedDate, (current) => ({ ...current, workHours: Number(event.target.value) }))} /><span>hours</span></div>
        </Field>
        <p className="helper-copy">Your entry is saved automatically. Quarter-hour increments work well: 1.25, 2.5, 4.75.</p>
      </Card>
      <Card>
        <SectionHead eyebrow="Last 12 weeks" title="Consistency heatmap" action={<CalendarDays size={18} className="muted-icon" />} />
        <WorkHeatmap data={data} anchor={selected} />
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow={`${period} view`} title="Work hours over time" action={<TrendingUp size={18} className="muted-icon" />} />
      <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -20, right: 6, top: 10 }}>
        <defs><linearGradient id="workFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#70d6a2" stopOpacity=".35"/><stop offset="1" stopColor="#70d6a2" stopOpacity="0"/></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} unit="h" />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Area type="monotone" dataKey="hours" stroke="#70d6a2" strokeWidth={2.5} fill="url(#workFill)" />
      </AreaChart></ResponsiveContainer></div>
    </Card>
  </div>
}

function WorkHeatmap({ data, anchor }: { data: SectionProps['data']; anchor: Date }) {
  const dates = rollingDates(84, anchor)
  const start = parseDate(dates[0])
  const leading = (start.getDay() + 6) % 7
  const cells = [...Array.from({ length: leading }, () => null), ...dates]
  const level = (hours: number) => hours === 0 ? 0 : hours <= 2 ? 1 : hours <= 4 ? 2 : 3
  return <div className="heatmap-wrap">
    <div className="heatmap-days"><span>Mon</span><span>Wed</span><span>Fri</span></div>
    <div className="heatmap">{cells.map((date, index) => date ? <div key={date} className={`heat-cell level-${level(getEntry(data, date).workHours)} ${date === localDateKey() ? 'today' : ''}`} title={`${niceDate(date, true)}: ${number.format(getEntry(data, date).workHours)}h`} /> : <div key={`blank-${index}`} />)}</div>
    <div className="heat-legend"><span>0h</span><i className="level-0"/><i className="level-1"/><i className="level-2"/><i className="level-3"/><span>5–6+h</span></div>
  </div>
}
