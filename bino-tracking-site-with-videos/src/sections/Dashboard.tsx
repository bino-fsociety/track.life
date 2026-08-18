import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, Award, Brain, BriefcaseBusiness, Dumbbell, MoonStar, Sparkles, Video, WalletCards } from 'lucide-react'
import { Card, SectionHead, Stat } from '../components/ui'
import { currentBalance, currency, getEntry, moneyTotals, niceDate, number, parseDate, rollingDates } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Dashboard({ data, selectedDate }: SectionProps) {
  const entry = getEntry(data, selectedDate)
  const money = moneyTotals(entry)
  const dates = rollingDates(7, parseDate(selectedDate))
  const chart = dates.map((date) => {
    const daily = getEntry(data, date)
    const totals = moneyTotals(daily)
    return { date: niceDate(date, true), income: totals.income, expenses: totals.expenses, work: daily.workHours, sleep: daily.sleep.hours }
  })
  const trained = entry.training.gym || entry.training.pushUps + entry.training.abs + entry.training.walkingMinutes + entry.training.runningMinutes > 0
  const moodLabel = ['Not logged', 'Very low', 'Low', 'Steady', 'Good', 'Excellent'][entry.mood.mood]
  const videosLeft = Math.max(0, entry.videos.target - entry.videos.made)

  return <div className="page">
    <SectionHead eyebrow={niceDate(selectedDate)} title="Your day, at a glance." />
    <div className="hero-card">
      <div>
        <span className="hero-kicker"><Sparkles size={15} /> Daily focus</span>
        <h1>{entry.journal.win || 'Make today count.'}</h1>
        <p>{entry.journal.win ? 'Your main win is captured and saved.' : 'Small, deliberate progress compounds. Capture your first win when it happens.'}</p>
      </div>
      <div className="hero-balance"><span>Money available</span><strong>{currency.format(currentBalance(data))}</strong><small>All-time current balance</small></div>
    </div>

    <div className="summary-grid">
      <SummaryCard icon={<ArrowUpRight />} label="Made today" value={currency.format(money.income)} accent="green" />
      <SummaryCard icon={<ArrowDownRight />} label="Spent today" value={currency.format(money.expenses)} accent="red" />
      <SummaryCard icon={<Dumbbell />} label="Training" value={trained ? 'Completed' : 'Not yet'} accent={trained ? 'green' : 'neutral'} />
      <SummaryCard icon={<BriefcaseBusiness />} label="Work hours" value={`${number.format(entry.workHours)}h`} accent="gold" />
      <SummaryCard icon={<MoonStar />} label="Sleep" value={entry.sleep.hours ? `${number.format(entry.sleep.hours)}h` : 'Not logged'} accent="blue" />
      <SummaryCard icon={<Brain />} label="Mood" value={moodLabel} accent="violet" />
      <SummaryCard icon={<Video />} label="Videos left" value={videosLeft ? number.format(videosLeft) : 'Done'} accent={videosLeft ? 'gold' : 'green'} />
    </div>

    <div className="chart-grid">
      <Card>
        <SectionHead eyebrow="Last 7 days" title="Money flow" action={<WalletCards size={18} className="muted-icon" />} />
        <div className="chart-height">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -20, right: 4, top: 8 }}>
            <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#70d6a2" stopOpacity={0.35}/><stop offset="100%" stopColor="#70d6a2" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} />
            <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(value) => currency.format(Number(value))} width={56} />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,.12)' }} formatter={(value) => currency.format(Number(value))} />
            <Area type="monotone" dataKey="income" stroke="#70d6a2" strokeWidth={2.5} fill="url(#incomeFill)" />
            <Area type="monotone" dataKey="expenses" stroke="#e97e7e" strokeWidth={2} fill="transparent" />
          </AreaChart></ResponsiveContainer>
        </div>
        <div className="chart-legend"><span><i className="green" />Income</span><span><i className="red" />Expenses</span></div>
      </Card>
      <Card>
        <SectionHead eyebrow="Last 7 days" title="Rhythm" action={<Award size={18} className="muted-icon" />} />
        <div className="chart-height">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ left: -20, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} />
            <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
            <Bar dataKey="work" fill="#c8a76a" radius={[5,5,0,0]} maxBarSize={26} />
            <Bar dataKey="sleep" fill="#6f85cd" radius={[5,5,0,0]} maxBarSize={26} />
          </BarChart></ResponsiveContainer>
        </div>
        <div className="chart-legend"><span><i className="gold" />Work</span><span><i className="blue" />Sleep</span></div>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow="Daily progress" title="The essentials" />
      <div className="essentials-grid">
        <Stat label="Net today" value={currency.format(money.profit)} tone={money.profit >= 0 ? 'good' : 'bad'} />
        <Stat label="Push-ups" value={number.format(entry.training.pushUps)} note="today" />
        <Stat label="Movement" value={`${entry.training.walkingMinutes + entry.training.runningMinutes} min`} note="walk + run" />
        <Stat label="Energy" value={entry.mood.energy ? `${entry.mood.energy}/5` : '—'} note="self-rated" tone="gold" />
        <Stat label="Video target" value={`${number.format(entry.videos.made)} / ${number.format(entry.videos.target)}`} note="made today" tone={videosLeft ? 'default' : 'good'} />
      </div>
    </Card>
  </div>
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return <Card className={`summary-card accent-${accent}`}><span className="summary-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></Card>
}
