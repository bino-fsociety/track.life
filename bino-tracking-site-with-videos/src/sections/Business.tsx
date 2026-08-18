import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Clock3, Plus, Trash2, TrendingUp } from 'lucide-react'
import { Button, Card, EmptyState, Field, Input, SectionHead, Stat, Textarea } from '../components/ui'
import type { BusinessEntry } from '../types'
import { currency, newId, niceDate, number, parseDate, periodDates, sum } from '../utils'
import type { SectionProps } from './shared'

const emptyForm = { project: '', task: '', revenue: '', expense: '', hours: '', notes: '' }

export function Business({ data, selectedDate, commit }: SectionProps) {
  const [form, setForm] = useState(emptyForm)
  const monthDates = new Set(periodDates('month', parseDate(selectedDate)))
  const monthEntries = data.businessEntries.filter((entry) => monthDates.has(entry.date))
  const revenue = sum(monthEntries.map((entry) => entry.revenue))
  const expenses = sum(monthEntries.map((entry) => entry.expense))
  const hours = sum(monthEntries.map((entry) => entry.hours))
  const projects = useMemo(() => {
    const names = [...new Set(data.businessEntries.map((entry) => entry.project).filter(Boolean))]
    return names.map((name) => {
      const entries = data.businessEntries.filter((entry) => entry.project === name)
      return { name, revenue: sum(entries.map((entry) => entry.revenue)), expense: sum(entries.map((entry) => entry.expense)), hours: sum(entries.map((entry) => entry.hours)), tasks: entries.length }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [data.businessEntries])
  const selectedEntries = data.businessEntries.filter((entry) => entry.date === selectedDate)
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.project.trim() || !form.task.trim()) return
    const entry: BusinessEntry = { id: newId(), date: selectedDate, project: form.project.trim(), task: form.task.trim(), revenue: Number(form.revenue), expense: Number(form.expense), hours: Number(form.hours), notes: form.notes.trim() }
    commit((current) => ({ ...current, businessEntries: [...current.businessEntries, entry] }))
    setForm(emptyForm)
  }
  const remove = (id: string) => commit((current) => ({ ...current, businessEntries: current.businessEntries.filter((entry) => entry.id !== id) }))

  return <div className="page">
    <SectionHead eyebrow="Business tracker" title="Every project, one clear picture." />
    <div className="stats-grid four">
      <Stat label="Monthly revenue (€)" value={currency.format(revenue)} tone="good" />
      <Stat label="Monthly expense (€)" value={currency.format(expenses)} tone="bad" />
      <Stat label="Monthly profit (€)" value={currency.format(revenue - expenses)} tone="gold" />
      <Stat label="Monthly hours" value={`${number.format(hours)}h`} />
    </div>

    <div className="business-grid">
      <Card>
        <SectionHead eyebrow={niceDate(selectedDate)} title="Add completed work" action={<span className="round-icon gold"><BriefcaseBusiness /></span>} />
        <form className="form-stack" onSubmit={submit}>
          <div className="form-row">
            <Field label="Business / project"><Input list="project-names" value={form.project} onChange={(event) => set('project', event.target.value)} placeholder="e.g. Studio Bino" required /><datalist id="project-names">{projects.map((project) => <option key={project.name} value={project.name} />)}</datalist></Field>
            <Field label="Task completed"><Input value={form.task} onChange={(event) => set('task', event.target.value)} placeholder="What shipped today?" required /></Field>
          </div>
          <div className="form-row three">
            <Field label="Revenue (€)"><Input type="number" min="0" step="0.01" inputMode="decimal" value={form.revenue} onChange={(event) => set('revenue', event.target.value)} placeholder="0" /></Field>
            <Field label="Expense (€)"><Input type="number" min="0" step="0.01" inputMode="decimal" value={form.expense} onChange={(event) => set('expense', event.target.value)} placeholder="0" /></Field>
            <Field label="Hours"><Input type="number" min="0" max="24" step="0.25" inputMode="decimal" value={form.hours} onChange={(event) => set('hours', event.target.value)} placeholder="0" /></Field>
          </div>
          <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Context, outcome, next step…" /></Field>
          <Button type="submit"><Plus size={16} /> Add business entry</Button>
        </form>
      </Card>

      <Card>
        <SectionHead eyebrow="Portfolio" title="Project performance" action={<TrendingUp size={18} className="muted-icon" />} />
        {!projects.length ? <EmptyState icon={<BriefcaseBusiness />} title="No projects yet" copy="Your first business entry will create a project automatically." /> : <div className="project-list">{projects.map((project) => {
          const margin = project.revenue - project.expense
          return <div className="project-card" key={project.name}><div className="project-head"><span>{project.name.slice(0, 1).toUpperCase()}</span><div><strong>{project.name}</strong><small>{project.tasks} entr{project.tasks === 1 ? 'y' : 'ies'} · {number.format(project.hours)}h</small></div></div><div className="project-money"><span>All-time profit</span><strong className={margin >= 0 ? 'positive-text' : 'negative-text'}>{currency.format(margin)}</strong></div></div>
        })}</div>}
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow="Selected day" title="Completed business work" />
      {!selectedEntries.length ? <EmptyState icon={<Clock3 />} title="No work entries" copy="Capture a completed task above to start building your business history." /> : <div className="item-list business-items">{selectedEntries.map((entry) => <div className="list-item" key={entry.id}><div><strong>{entry.task}</strong><span>{entry.project} · {number.format(entry.hours)}h{entry.notes ? ` · ${entry.notes}` : ''}</span></div><div><b>{currency.format(entry.revenue - entry.expense)}</b><button onClick={() => remove(entry.id)} aria-label="Delete"><Trash2 size={15} /></button></div></div>)}</div>}
    </Card>
  </div>
}
