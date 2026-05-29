import { useState } from 'react'
import { emptyForm, priorityOptions, statusOptions } from '../lib.js'
import { input, labelText, primaryBtn, subPanel } from './ui.jsx'

export default function AddForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm)

  function update(field, value) {
    setForm((cur) => ({ ...cur, [field]: value }))
  }

  function submit() {
    if (onAdd(form)) setForm(emptyForm)
  }

  // Enter submits from any single-line field; Esc clears the form.
  function onKeyDown(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') setForm(emptyForm)
  }

  return (
    <div className={subPanel} onKeyDown={onKeyDown}>
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Add your work bucket list item</h2>

      <label className="mb-4 block">
        <span className={labelText}>Work item</span>
        <input
          className={input}
          placeholder="Example: Create GitHub repo for AI project"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          autoFocus
        />
      </label>

      <label className="mb-4 block">
        <span className={labelText}>Category</span>
        <input
          className={input}
          placeholder="Example: GitHub / Security / Certification"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
        />
      </label>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Priority</span>
          <select className={input} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
            {priorityOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelText}>Status</span>
          <select className={input} value={form.status} onChange={(e) => update('status', e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mb-4 block">
        <span className={labelText}>Target date</span>
        <input type="date" className={input} value={form.targetDate} onChange={(e) => update('targetDate', e.target.value)} />
      </label>

      <label className="mb-4 block">
        <span className={labelText}>Notes</span>
        <textarea
          rows="4"
          className={input}
          placeholder="Add short notes, next action, owner, or dependency."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </label>

      <button onClick={submit} className={`w-full ${primaryBtn}`}>
        Add Item
      </button>
      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        Tip: press Enter to add, Esc to clear
      </p>
    </div>
  )
}
