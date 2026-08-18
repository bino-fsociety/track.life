export type DateKey = string
export type Period = 'week' | 'month' | 'year'

export interface MoneyItem {
  id: string
  amount: number
  category: string
  note: string
}

export interface DailyEntry {
  date: DateKey
  income: MoneyItem[]
  expenses: MoneyItem[]
  training: {
    gym: boolean
    pushUps: number
    abs: number
    walkingMinutes: number
    runningMinutes: number
    notes: string
  }
  workHours: number
  sleep: { hours: number; quality: number; notes: string }
  mood: { mood: number; energy: number; stress: number; note: string }
  videos: {
    target: number
    made: number
    youtube: number
    shorts: number
    ideas: number
    notes: string
  }
  journal: { win: string; learned: string; improved: string; tomorrow: string }
}

export interface BusinessEntry {
  id: string
  date: DateKey
  project: string
  task: string
  revenue: number
  expense: number
  hours: number
  notes: string
}

export interface Goal {
  id: string
  title: string
  category: string
  target: number
  progress: number
  deadline: DateKey
  notes: string
  completed: boolean
  createdAt: DateKey
}

export interface AppData {
  version: 1
  currency: 'EUR'
  startingBalance: number
  entries: Record<DateKey, DailyEntry>
  businessEntries: BusinessEntry[]
  goals: Goal[]
}

export const createDailyEntry = (date: DateKey): DailyEntry => ({
  date,
  income: [],
  expenses: [],
  training: {
    gym: false,
    pushUps: 0,
    abs: 0,
    walkingMinutes: 0,
    runningMinutes: 0,
    notes: '',
  },
  workHours: 0,
  sleep: { hours: 0, quality: 0, notes: '' },
  mood: { mood: 0, energy: 0, stress: 0, note: '' },
  videos: { target: 1, made: 0, youtube: 0, shorts: 0, ideas: 0, notes: '' },
  journal: { win: '', learned: '', improved: '', tomorrow: '' },
})

export const createEmptyData = (): AppData => ({
  version: 1,
  currency: 'EUR',
  startingBalance: 0,
  entries: {},
  businessEntries: [],
  goals: [],
})
