import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Period } from '../types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input textarea ${props.className ?? ''}`} />
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className="select-wrap"><select {...props} className={`input ${props.className ?? ''}`}>{children}</select><ChevronDown size={15} /></span>
}

export function Button({ children, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  return <button {...props} className={`button button-${variant} ${props.className ?? ''}`}>{children}</button>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" className={`toggle ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className="toggle-knob">{checked && <Check size={12} strokeWidth={3} />}</span>
      <span>{label}</span>
    </button>
  )
}

export function PeriodTabs({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <div className="period-tabs">
      {(['week', 'month', 'year'] as Period[]).map((period) => (
        <button key={period} className={value === period ? 'active' : ''} onClick={() => onChange(period)}>{period}</button>
      ))}
    </div>
  )
}

export function Rating({ value, onChange, labels }: { value: number; onChange: (value: number) => void; labels?: string[] }) {
  return (
    <div className="rating" role="radiogroup">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          type="button"
          key={rating}
          onClick={() => onChange(rating)}
          className={value === rating ? 'active' : ''}
          aria-label={labels?.[rating - 1] ?? `${rating} out of 5`}
          title={labels?.[rating - 1]}
        >{rating}</button>
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{copy}</p></div>
}

export function Stat({ label, value, note, tone = 'default' }: { label: string; value: string; note?: string; tone?: 'default' | 'good' | 'bad' | 'gold' }) {
  return <div className={`stat tone-${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
}
