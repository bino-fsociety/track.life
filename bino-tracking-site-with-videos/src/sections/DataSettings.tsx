import { useRef, useState } from 'react'
import { ArchiveRestore, CheckCircle2, Database, Download, HardDrive, LockKeyhole, RotateCcw, ShieldCheck, Upload, X } from 'lucide-react'
import { Button, Card, SectionHead, Stat } from '../components/ui'
import type { AppData } from '../types'
import { localDateKey, normalizeData } from '../utils'

export function DataSettings({ data, importData, reset }: { data: AppData; importData: (data: AppData) => Promise<void>; reset: () => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const journalDays = Object.values(data.entries).filter((entry) => Object.values(entry.journal).some(Boolean)).length

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bino-tracking-app-backup-${localDateKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup downloaded successfully.')
  }
  const restoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as Partial<AppData>
      if (parsed.version !== 1 || typeof parsed.entries !== 'object' || !Array.isArray(parsed.goals) || !Array.isArray(parsed.businessEntries)) throw new Error('Invalid backup')
      await importData(normalizeData({ ...parsed, currency: 'EUR' } as AppData))
      setMessage('Backup restored. Your data is ready.')
    } catch {
      setMessage('That file is not a valid Bino Tracking App backup.')
    }
    event.target.value = ''
  }
  const clear = async () => { await reset(); setConfirmReset(false); setMessage('All tracking data has been reset.') }

  return <div className="page">
    <SectionHead eyebrow="Data & backup" title="Your data. Under your control." />
    <div className="privacy-hero">
      <span><ShieldCheck /></span><div><h2>Private by default.</h2><p>Bino Tracking App stores everything in this browser on this device. No account, analytics, subscription, or cloud server is involved.</p></div>
    </div>
    <div className="stats-grid three">
      <Stat label="Days with data" value={`${Object.keys(data.entries).length}`} tone="gold" />
      <Stat label="Business entries" value={`${data.businessEntries.length}`} />
      <Stat label="Journal days" value={`${journalDays}`} tone="good" />
    </div>

    {message && <div className="notice"><CheckCircle2 size={17} /><span>{message}</span><button onClick={() => setMessage('')}><X size={16} /></button></div>}

    <div className="data-grid">
      <Card className="data-card">
        <span className="data-icon"><Download /></span><div><p className="eyebrow">Backup</p><h3>Export your data</h3><p>Download one readable JSON file containing every tracker, goal, and journal entry.</p></div><Button onClick={exportBackup}><Download size={16} /> Download backup</Button>
      </Card>
      <Card className="data-card">
        <span className="data-icon"><ArchiveRestore /></span><div><p className="eyebrow">Restore</p><h3>Import a backup</h3><p>Restore data from a Bino Tracking App JSON file. The backup will replace the current data.</p></div><input ref={inputRef} className="hidden-file" type="file" accept="application/json,.json" onChange={restoreBackup} /><Button variant="secondary" onClick={() => inputRef.current?.click()}><Upload size={16} /> Choose backup</Button>
      </Card>
    </div>

    <Card>
      <SectionHead eyebrow="How it works" title="Local-first storage" action={<HardDrive size={19} className="muted-icon" />} />
      <div className="security-list">
        <SecurityItem icon={<Database />} title="Automatic browser database" copy="Every change is written to IndexedDB within a moment—closing the tab or restarting the app does not erase it." />
        <SecurityItem icon={<LockKeyhole />} title="No one else receives it" copy="There is no backend and nothing is uploaded. The only copy is in the browser profile you are using." />
        <SecurityItem icon={<Download />} title="You hold the backup" copy="Export regularly and keep the JSON file somewhere safe, such as an external drive or your private files." />
      </div>
    </Card>

    <Card className="danger-zone"><div><span className="icon-box danger"><RotateCcw /></span><div><strong>Reset all tracking data</strong><p>Permanently erase all entries, goals, projects, and your starting balance from this browser.</p></div></div><Button variant="danger" onClick={() => setConfirmReset(true)}>Reset data</Button></Card>

    {confirmReset && <div className="modal-backdrop"><div className="confirm-modal"><span className="modal-icon"><RotateCcw /></span><h3>Reset everything?</h3><p>This cannot be undone unless you exported a backup first.</p><div><Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={clear}>Yes, erase all data</Button></div></div></div>}
  </div>
}

function SecurityItem({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div><span>{icon}</span><div><strong>{title}</strong><p>{copy}</p></div></div>
}
