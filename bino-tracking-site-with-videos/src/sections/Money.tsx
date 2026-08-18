import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, BadgeEuro, Plus, Trash2, Wallet } from 'lucide-react'
import { Button, Card, EmptyState, Field, Input, PeriodTabs, SectionHead, Select, Stat } from '../components/ui'
import type { MoneyItem, Period } from '../types'
import { balanceThrough, currentBalance, currency, getEntry, moneyTotals, newId, niceDate, parseDate, periodDates, sum } from '../utils'
import type { SectionProps } from './shared'
import { axisStyle, chartTooltipStyle } from './shared'

const expenseCategories = ['Food', 'Transport', 'Housing', 'Health', 'Shopping', 'Business', 'Subscriptions', 'Other']

export function Money({ data, selectedDate, updateEntry, commit }: SectionProps) {
  const [period, setPeriod] = useState<Period>('month')
  const entry = getEntry(data, selectedDate)
  const today = moneyTotals(entry)
  const dates = periodDates(period, parseDate(selectedDate))
  const periodEntries = dates.map((date) => getEntry(data, date))
  const totalIncome = sum(periodEntries.flatMap((item) => item.income.map((value) => value.amount)))
  const totalExpenses = sum(periodEntries.flatMap((item) => item.expenses.map((value) => value.amount)))
  const chart = useMemo(() => dates.map((date) => {
    const totals = moneyTotals(getEntry(data, date))
    return { date: niceDate(date, true), income: totals.income, expenses: totals.expenses, balance: balanceThrough(data, date) }
  }), [data, dates])

  const addItem = (kind: 'income' | 'expenses', item: Omit<MoneyItem, 'id'>) => updateEntry(selectedDate, (current) => ({
    ...current,
    [kind]: [...current[kind], { ...item, id: newId() }],
  }))
  const removeItem = (kind: 'income' | 'expenses', id: string) => updateEntry(selectedDate, (current) => ({
    ...current,
    [kind]: current[kind].filter((item) => item.id !== id),
  }))

  return <div className="page">
    <SectionHead eyebrow="Money tracker" title="Know exactly where you stand." action={<PeriodTabs value={period} onChange={setPeriod} />} />
    <div className="stats-grid five">
      <Stat label="Income (€)" value={currency.format(today.income)} note="today" tone="good" />
      <Stat label="Expenses (€)" value={currency.format(today.expenses)} note="today" tone="bad" />
      <Stat label="Profit / Loss (€)" value={currency.format(today.profit)} note="today" tone={today.profit >= 0 ? 'good' : 'bad'} />
      <Stat label="Current Balance (€)" value={currency.format(currentBalance(data))} tone="gold" />
      <Stat label={`${period} net (€)`} value={currency.format(totalIncome - totalExpenses)} />
    </div>

    <div className="two-column">
      <TransactionForm kind="income" onAdd={(item) => addItem('income', item)} />
      <TransactionForm kind="expense" onAdd={(item) => addItem('expenses', item)} />
    </div>

    <Card>
      <SectionHead eyebrow={`${period} view`} title="Income and spending" />
      <div className="chart-height large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: -14, right: 6, top: 10 }}>
        <defs>
          <linearGradient id="moneyIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#70d6a2" stopOpacity=".32"/><stop offset="1" stopColor="#70d6a2" stopOpacity="0"/></linearGradient>
          <linearGradient id="moneyExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e97e7e" stopOpacity=".18"/><stop offset="1" stopColor="#e97e7e" stopOpacity="0"/></linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(value) => currency.format(Number(value))} width={62} />
        <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => currency.format(Number(value))} />
        <Area type="monotone" dataKey="income" stroke="#70d6a2" fill="url(#moneyIncome)" strokeWidth={2.5} />
        <Area type="monotone" dataKey="expenses" stroke="#e97e7e" fill="url(#moneyExpense)" strokeWidth={2.5} />
        <Area type="monotone" dataKey="balance" stroke="#c8a76a" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
      </AreaChart></ResponsiveContainer></div>
      <div className="chart-legend"><span><i className="green" />{currency.format(totalIncome)} income</span><span><i className="red" />{currency.format(totalExpenses)} expenses</span><span><i className="gold" />Running balance</span></div>
    </Card>

    <div className="two-column">
      <TransactionList title="Income" icon={<ArrowUpRight />} items={entry.income} empty="No income logged for this day." onRemove={(id) => removeItem('income', id)} />
      <TransactionList title="Expenses" icon={<ArrowDownRight />} items={entry.expenses} empty="No expenses logged for this day." onRemove={(id) => removeItem('expenses', id)} />
    </div>

    <Card className="balance-setting">
      <div><span className="icon-box"><Wallet /></span><div><strong>Starting Balance (€)</strong><p>The amount in euros you had before your first tracked transaction.</p></div></div>
      <Field label="Starting Balance (€)"><Input type="number" min="0" step="0.01" value={data.startingBalance || ''} placeholder="0" onChange={(event) => commit((current) => ({ ...current, startingBalance: Number(event.target.value) }))} /></Field>
    </Card>
  </div>
}

function TransactionForm({ kind, onAdd }: { kind: 'income' | 'expense'; onAdd: (item: Omit<MoneyItem, 'id'>) => void }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(kind === 'income' ? 'Income' : expenseCategories[0])
  const [note, setNote] = useState('')
  const income = kind === 'income'
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!Number(amount)) return
    onAdd({ amount: Number(amount), category, note })
    setAmount(''); setNote('')
  }
  return <Card><SectionHead eyebrow={`Add ${kind}`} title={income ? 'Money in' : 'Money out'} action={<span className={`round-icon ${income ? 'positive' : 'negative'}`}>{income ? <ArrowUpRight /> : <ArrowDownRight />}</span>} />
    <form className="form-stack" onSubmit={submit}>
      <Field label={income ? 'Income (€)' : 'Expenses (€)'}><Input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></Field>
      <div className="form-row">
        <Field label="Category">{income ? <Input value={category} onChange={(event) => setCategory(event.target.value)} /> : <Select value={category} onChange={(event) => setCategory(event.target.value)}>{expenseCategories.map((item) => <option key={item}>{item}</option>)}</Select>}</Field>
        <Field label="Note"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional detail" /></Field>
      </div>
      <Button type="submit"><Plus size={16} /> Add {kind}</Button>
    </form>
  </Card>
}

function TransactionList({ title, icon, items, empty, onRemove }: { title: string; icon: React.ReactNode; items: MoneyItem[]; empty: string; onRemove: (id: string) => void }) {
  return <Card><SectionHead eyebrow="Selected day" title={title} action={<span className="muted-icon">{icon}</span>} />
    {!items.length ? <EmptyState icon={<BadgeEuro />} title="Nothing here yet" copy={empty} /> : <div className="item-list">{items.map((item) => <div className="list-item" key={item.id}><div><strong>{item.category}</strong><span>{item.note || 'No note'}</span></div><div><b>{currency.format(item.amount)}</b><button onClick={() => onRemove(item.id)} aria-label="Delete"><Trash2 size={15} /></button></div></div>)}</div>}
  </Card>
}
