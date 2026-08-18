import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clapperboard, Flame, Lightbulb, Target, Video } from 'lucide-react'
import { Card, Field, Input, PeriodTabs, SectionHead, Stat, Textarea } from '../components/ui'
import type { Period } from '../types'
import { getEntry, niceDate, number, parseDate, periodDates, streak, sum } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

export function Videos({ data, selectedDate, updateEntry }: SectionProps) {
  const [period, setPeriod] = useState<Period>('week')
  const entry = getEntry(data, selectedDate)
  const videos = entry.videos
  const dates = periodDates(period, parseDate(selectedDate))
  const entries = dates.map((date) => getEntry(data, date))
  const madeTotal = sum(entries.map((item) => item.videos.made))
  const targetTotal = sum(entries.map((item) => item.videos.target))
  const youtubeTotal = sum(entries.map((item) => item.videos.youtube))
  const shortsTotal = sum(entries.map((item) => item.videos.shorts))
  const ideaTotal = sum(entries.map((item) => item.videos.ideas))
  const progress = videos.target ? Math.min(100, Math.round((videos.made / videos.target) * 100)) : 0
  const remaining = Math.max(0, videos.target - videos.made)
  const videoStreak = streak(Object.values(data.entries).map((item) => ({ date: item.date, active: (item.videos?.made ?? 0) >= (item.videos?.target ?? 1) })), selectedDate)
  const chart = dates.map((date) => {
    const daily = getEntry(data, date).videos
    return { date: niceDate(date, true), made: daily.made, target: daily.target, youtube: daily.youtube, shorts: daily.shorts, ideas: daily.ideas }
  })
  const setVideo = <K extends keyof typeof videos>(key: K, value: typeof videos[K]) => updateEntry(selectedDate, (current) => ({
    ...current,
    videos: { ...getEntry(data, selectedDate).videos, ...current.videos, [key]: value },
  }))

  return <div className="page">
    <SectionHead eyebrow="Videos tracker" title="Know exactly what to create today." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="hero-card video-hero">
      <div>
        <span className="hero-kicker"><Video size={15} /> YouTube focus</span>
        <h1>{remaining ? `${remaining} video${remaining === 1 ? '' : 's'} left today.` : 'Video goal complete.'}</h1>
        <p>{remaining ? `Your target is ${number.format(videos.target)} video${videos.target === 1 ? '' : 's'} today. You have made ${number.format(videos.made)} so far.` : 'Nice. You hit today’s video target — anything extra is bonus momentum.'}</p>
      </div>
      <div className="hero-balance"><span>Today’s progress</span><strong>{progress}%</strong><small>{number.format(videos.made)} of {number.format(videos.target)} videos</small></div>
    </div>

    <div className="stats-grid five">
      <Stat label="Need today" value={number.format(remaining)} note="videos remaining" tone={remaining ? 'gold' : 'good'} />
      <Stat label="Made today" value={number.format(videos.made)} note="all video output" tone="good" />
      <Stat label={`${period} videos`} value={number.format(madeTotal)} note={`${number.format(targetTotal)} target`} />
      <Stat label="YouTube" value={number.format(youtubeTotal)} note={`this ${period}`} tone="gold" />
      <Stat label="Target streak" value={`${videoStreak} day${videoStreak === 1 ? '' : 's'}`} note="goal met" />
    </div>

    <div className="two-column">
      <Card>
        <SectionHead eyebrow={niceDate(selectedDate)} title="Daily video plan" action={<span className="round-icon gold"><Clapperboard /></span>} />
        <div className="form-stack">
          <div className="form-row three">
            <Field label="Target videos today"><Input type="number" min="0" step="1" inputMode="numeric" value={videos.target || ''} placeholder="1" onChange={(event) => setVideo('target', Number(event.target.value))} /></Field>
            <Field label="Videos made"><Input type="number" min="0" step="1" inputMode="numeric" value={videos.made || ''} placeholder="0" onChange={(event) => setVideo('made', Number(event.target.value))} /></Field>
            <Field label="Ideas captured"><Input type="number" min="0" step="1" inputMode="numeric" value={videos.ideas || ''} placeholder="0" onChange={(event) => setVideo('ideas', Number(event.target.value))} /></Field>
          </div>
          <div className="form-row">
            <Field label="YouTube videos"><Input type="number" min="0" step="1" inputMode="numeric" value={videos.youtube || ''} placeholder="0" onChange={(event) => setVideo('youtube', Number(event.target.value))} /></Field>
            <Field label="Shorts / reels"><Input type="number" min="0" step="1" inputMode="numeric" value={videos.shorts || ''} placeholder="0" onChange={(event) => setVideo('shorts', Number(event.target.value))} /></Field>
          </div>
          <Field label="Video notes"><Textarea rows={4} value={videos.notes} onChange={(event) => setVideo('notes', event.target.value)} placeholder="What should you record, edit, post, or improve today?" /></Field>
        </div>
      </Card>

      <Card>
        <SectionHead eyebrow="Creator momentum" title="Daily target" action={<Target size={18} className="muted-icon" />} />
        <div className="mood-orbit">
          <div className="mood-score"><span>Today</span><strong>{number.format(videos.made)}</strong><small>/ {number.format(videos.target)} videos</small></div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
        </div>
        <p className="center-copy">{videos.notes || 'Set your target, capture ideas, and track what actually gets made. The goal is clarity, not pressure.'}</p>
        <div className="streak-banner"><Flame /><div><strong>{videoStreak ? `${videoStreak}-day video streak` : 'Start your creator streak'}</strong><span>{videoStreak ? 'You are meeting your daily video target.' : 'Hit today’s target to begin.'}</span></div></div>
      </Card>
    </div>

    <div className="chart-grid">
      <Card>
        <SectionHead eyebrow={`${period} view`} title="Videos made vs target" />
        <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -20, right: 5, top: 12 }}>
          <defs><linearGradient id="videoFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8a76a" stopOpacity=".35"/><stop offset="1" stopColor="#c8a76a" stopOpacity="0"/></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Area type="monotone" dataKey="target" stroke="#758bd5" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
          <Area type="monotone" dataKey="made" stroke="#c8a76a" strokeWidth={2.5} fill="url(#videoFill)" />
        </AreaChart></ResponsiveContainer></div>
        <div className="chart-legend"><span><i className="gold" />Made</span><span><i className="blue" />Target</span></div>
      </Card>

      <Card>
        <SectionHead eyebrow={`${period} breakdown`} title="YouTube, shorts & ideas" action={<Lightbulb size={18} className="muted-icon" />} />
        <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ left: -20, right: 5, top: 12 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
          <Bar dataKey="youtube" name="YouTube" fill="#c8a76a" radius={[5,5,0,0]} maxBarSize={22} />
          <Bar dataKey="shorts" name="Shorts" fill="#70d6a2" radius={[5,5,0,0]} maxBarSize={22} />
          <Bar dataKey="ideas" name="Ideas" fill="#758bd5" radius={[5,5,0,0]} maxBarSize={22} />
        </BarChart></ResponsiveContainer></div>
        <div className="chart-legend"><span><i className="gold" />YouTube</span><span><i className="green" />Shorts</span><span><i className="blue" />Ideas</span></div>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow="Creator summary" title="What the numbers mean" />
      <div className="essentials-grid">
        <Stat label="Videos left today" value={number.format(remaining)} tone={remaining ? 'gold' : 'good'} />
        <Stat label="Shorts this period" value={number.format(shortsTotal)} />
        <Stat label="Ideas this period" value={number.format(ideaTotal)} tone="gold" />
        <Stat label="Completion" value={`${progress}%`} note="today" tone={progress >= 100 ? 'good' : 'default'} />
      </div>
    </Card>
  </div>
}
