import type { AppData, DailyEntry, DateKey, Period } from './types'
import { createDailyEntry } from './types'

export const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

export function localDateKey(date = new Date()): DateKey {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function parseDate(key: DateKey) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function niceDate(key: DateKey, short = false) {
  return parseDate(key).toLocaleDateString('en-US', short
    ? { month: 'short', day: 'numeric' }
    : { weekday: 'long', month: 'long', day: 'numeric' })
}

export function getEntry(data: AppData, date: DateKey): DailyEntry {
  return normalizeEntry(data.entries[date], date)
}

export function normalizeEntry(entry: DailyEntry | undefined, date: DateKey): DailyEntry {
  const empty = createDailyEntry(date)
  if (!entry) return empty
  return {
    ...empty,
    ...entry,
    training: { ...empty.training, ...entry.training },
    sleep: { ...empty.sleep, ...entry.sleep },
    mood: { ...empty.mood, ...entry.mood },
    videos: { ...empty.videos, ...entry.videos },
    journal: { ...empty.journal, ...entry.journal },
  }
}

export function normalizeData(data: AppData): AppData {
  return {
    ...data,
    version: 1,
    currency: 'EUR',
    entries: Object.fromEntries(Object.entries(data.entries ?? {}).map(([date, entry]) => [date, normalizeEntry(entry, date)])),
    businessEntries: data.businessEntries ?? [],
    goals: data.goals ?? [],
  }
}

export function datesBetween(start: Date, end: Date) {
  const result: DateKey[] = []
  const date = new Date(start)
  while (date <= end) {
    result.push(localDateKey(date))
    date.setDate(date.getDate() + 1)
  }
  return result
}

export function periodDates(period: Period, anchor = new Date()) {
  let start: Date
  const end = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
  if (period === 'week') {
    start = new Date(end)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
  } else if (period === 'month') {
    start = new Date(end.getFullYear(), end.getMonth(), 1)
  } else {
    start = new Date(end.getFullYear(), 0, 1)
  }
  return datesBetween(start, end)
}

export function rollingDates(days: number, anchor = new Date()) {
  const end = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)
  return datesBetween(start, end)
}

export const sum = (values: number[]) => values.reduce((total, value) => total + (Number(value) || 0), 0)

export function moneyTotals(entry: DailyEntry) {
  const income = sum(entry.income.map((item) => item.amount))
  const expenses = sum(entry.expenses.map((item) => item.amount))
  return { income, expenses, profit: income - expenses }
}

export function currentBalance(data: AppData) {
  return data.startingBalance + sum(Object.values(data.entries).flatMap((entry) => [
    ...entry.income.map((item) => item.amount),
    ...entry.expenses.map((item) => -item.amount),
  ]))
}

export function balanceThrough(data: AppData, date: DateKey) {
  return data.startingBalance + sum(Object.values(data.entries)
    .filter((entry) => entry.date <= date)
    .flatMap((entry) => [
      ...entry.income.map((item) => item.amount),
      ...entry.expenses.map((item) => -item.amount),
    ]))
}

export function streak(values: { date: DateKey; active: boolean }[], today = localDateKey()) {
  const map = new Map(values.map((item) => [item.date, item.active]))
  let count = 0
  const cursor = parseDate(today)
  if (!map.get(today)) cursor.setDate(cursor.getDate() - 1)
  while (map.get(localDateKey(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function newId() {
  return crypto.randomUUID()
}

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))
