import { useState } from 'react'
import {
  buildOutlookHtml,
  buildOutlookText,
  getStatusIcon,
  toCSV,
  triggerDownload,
} from '../lib.js'
import { input, labelText, primaryBtn, subPanel } from './ui.jsx'

export default function OutlookPanel({ items, summary, name, setName, onImport }) {
  const [copyStatus, setCopyStatus] = useState('')

  async function copyForOutlook() {
    setCopyStatus('')
    const html = buildOutlookHtml(items, summary, name)
    const text = buildOutlookText(items, summary, name)
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
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className={subPanel}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Copy for Outlook</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This copies a clean HTML table. Paste it directly into the Outlook mail body.
        </p>

        <label className="mt-4 block">
          <span className={labelText}>Your name (used in signature)</span>
          <input className={input} placeholder="e.g. Shweta Jadhav" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <button onClick={copyForOutlook} className={`mt-4 w-full ${primaryBtn}`}>
          Copy Outlook Format
        </button>

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

      <div className={`${subPanel} bg-white dark:bg-slate-800`}>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Outlook preview</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          <p>Hi Team,</p>
          <p className="mt-2">Please find my work bucket list status below.</p>
          <p className="mt-2">
            <b>Overall Completion:</b> {summary.progress}% completed ({summary.done}/{summary.total} done)
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-50 dark:bg-slate-700">
                  {['No.', 'Work Bucket Item', 'Category', 'Priority', 'Status', 'Target Date', 'Notes'].map((h) => (
                    <th key={h} className="border border-slate-200 p-2 text-left dark:border-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="border border-slate-200 p-2 dark:border-slate-600">
                      No items added.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{index + 1}</td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{item.title}</td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{item.category || '-'}</td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{item.priority}</td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">
                        {getStatusIcon(item.status)} {item.status}
                      </td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{item.targetDate || '-'}</td>
                      <td className="border border-slate-200 p-2 dark:border-slate-600">{item.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            Regards,
            <br />
            {name.trim() || 'Me'}
          </p>
        </div>
      </div>
    </div>
  )
}
