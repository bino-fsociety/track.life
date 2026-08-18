import { useMemo, useState } from 'react'
import { BookOpenText, CalendarSearch, ChevronRight, Lightbulb, Search, Sparkles, TrendingUp } from 'lucide-react'
import { Card, EmptyState, Field, Input, SectionHead, Textarea } from '../components/ui'
import { getEntry, niceDate } from '../utils'
import type { SectionProps } from './shared'

export function Journal({ data, selectedDate, updateEntry }: SectionProps) {
  const entry = getEntry(data, selectedDate)
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const years = [...new Set(Object.keys(data.entries).map((date) => date.slice(0, 4)))].sort().reverse()
  const results = useMemo(() => Object.values(data.entries)
    .filter((item) => Object.values(item.journal).some(Boolean))
    .filter((item) => !month || item.date.slice(0, 7) === month)
    .filter((item) => !year || item.date.slice(0, 4) === year)
    .filter((item) => !search || Object.values(item.journal).join(' ').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [data.entries, month, search, year])
  const setJournal = (key: keyof typeof entry.journal, value: string) => updateEntry(selectedDate, (current) => ({ ...current, journal: { ...current.journal, [key]: value } }))

  return <div className="page">
    <SectionHead eyebrow="Wins journal" title="Keep proof of your progress." />
    <div className="journal-grid">
      <Card className="journal-editor">
        <SectionHead eyebrow={niceDate(selectedDate)} title="Daily reflection" action={<span className="round-icon gold"><BookOpenText /></span>} />
        <div className="form-stack">
          <JournalField icon={<Sparkles />} label="Main win of the day" placeholder="What are you proud of today?" value={entry.journal.win} onChange={(value) => setJournal('win', value)} />
          <JournalField icon={<Lightbulb />} label="What I learned" placeholder="A lesson, idea, or realization…" value={entry.journal.learned} onChange={(value) => setJournal('learned', value)} />
          <JournalField icon={<TrendingUp />} label="What I improved" placeholder="What got a little better?" value={entry.journal.improved} onChange={(value) => setJournal('improved', value)} />
          <JournalField icon={<ChevronRight />} label="What I want to do better tomorrow" placeholder="One clear intention for tomorrow…" value={entry.journal.tomorrow} onChange={(value) => setJournal('tomorrow', value)} />
        </div>
      </Card>
      <Card className="journal-history">
        <SectionHead eyebrow="Your archive" title="Past reflections" action={<CalendarSearch size={19} className="muted-icon" />} />
        <div className="journal-filters">
          <label className="search-input"><Search size={16} /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your journal" /></label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month" />
          <select className="input" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year"><option value="">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        {!results.length ? <EmptyState icon={<BookOpenText />} title="No reflections found" copy="Write today’s first win, or change your search filters." /> : <div className="journal-list">{results.map((item) => <article key={item.date}><time>{niceDate(item.date)}</time><strong>{item.journal.win || item.journal.learned || 'Daily reflection'}</strong>{item.journal.learned && <p><b>Learned:</b> {item.journal.learned}</p>}{item.journal.tomorrow && <p><b>Tomorrow:</b> {item.journal.tomorrow}</p>}</article>)}</div>}
      </Card>
    </div>
  </div>
}

function JournalField({ icon, label, value, placeholder, onChange }: { icon: React.ReactNode; label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <Field label={label}><div className="journal-field"><span>{icon}</span><Textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div></Field>
}
