import { useState } from 'react'
import { buildOutlookHtml, buildOutlookText, fmtDate, toCSV, triggerDownload } from '../lib.js'
import { input, labelText, primaryBtn, subPanel } from './ui.jsx'

/** Today as YYYY-MM-DD in local time (toISOString would be UTC and can be off by a day). */
function localToday() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function OutlookPanel({ items, summary, name, setName, greeting, setGreeting, onImport }) {
  const [copyStatus, setCopyStatus] = useState('')

  // Single source of truth: the preview renders this exact HTML, and the
  // copy button puts this exact HTML on the clipboard. They can never drift.
  // Safe to inject: every user-entered field is escaped inside buildOutlookHtml.
  const html = buildOutlookHtml(items, summary, name, greeting)
  const text = buildOutlookText(items, summary, name, greeting)
  const subject = `Work Bucket List Status - ${fmtDate(localToday())} - ${summary.progress}% complete`

  async function copyForOutlook() {
    setCopyStatus('')
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
        setCopyStatus('Copied. Now paste directly into Outlook.')
      } else {
        await navigator.clipboard.writeText(text)
        setCopyStatus('Copied as plain text. Now paste directly into Outlook.')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text)
        setCopyStatus('Copied as plain text. Now paste directly into Outlook.')
      } catch {
        setCopyStatus('Could not access clipboard. Copy manually from the preview.')
      }
    }
  }

  async function copySubject() {
    try {
      await navigator.clipboard.writeText(subject)
      setCopyStatus('Subject copied.')
    } catch {
      setCopyStatus('Could not access clipboard. Copy the subject manually.')
    }
  }

  function exportJson() {
    triggerDownload(JSON.stringify(items, null, 2), 'work-bucket-list.json', 'application/json')
  }

  function exportCsv() {
    triggerDownload(toCSV(items), 'work-bucket-list.csv', 'text/csv;charset=utf-8')
  }

  function importJson(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!Array.isArray(parsed)) throw new Error('Invalid JSON')
        onImport(parsed)
      } catch {
        alert('Invalid JSON file. Please import a valid bucket list export file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className={`${subPanel} min-w-0`}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Copy for Outlook</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This copies a clean HTML table. Paste it directly into the Outlook mail body.
        </p>

        <label className="mt-4 block">
          <span className={labelText}>Greeting (first line of the mail)</span>
          <input
            className={input}
            placeholder="e.g. Hi Sir"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className={labelText}>Your name (used in signature)</span>
          <input className={input} placeholder="e.g. Shweta Jadhav" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <button onClick={copyForOutlook} className={`mt-4 w-full ${primaryBtn}`}>
          Copy Outlook Format
        </button>

        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Suggested subject
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">{subject}</p>
          <button
            onClick={copySubject}
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Copy subject
          </button>
        </div>

        {copyStatus && (
          <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
            {copyStatus}
          </p>
        )}

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportJson}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Export JSON
            </button>
            <button
              onClick={exportCsv}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Export CSV
            </button>
          </div>
          <label className="block cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-center font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={importJson} />
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            JSON is for backup/restore. CSV opens in Excel. Importing replaces your current list.
          </p>
        </div>
      </div>

      <div className={`${subPanel} min-w-0 bg-white dark:bg-slate-800`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Outlook preview</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Exactly what gets pasted - shown on white, like a real mail
          </span>
        </div>
        {/* Always white, even in dark mode: this is how the email will actually look. */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  )
}
