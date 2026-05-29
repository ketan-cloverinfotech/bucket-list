import { useEffect, useState } from 'react'
import { THEME_KEY } from '../lib.js'

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [dark])
  return [dark, setDark]
}

export default function Header({ summary }) {
  const [dark, setDark] = useTheme()

  return (
    <section className="mb-6 rounded-3xl bg-white p-6 shadow-xl shadow-blue-100 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-slate-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              Work Bucket List Tracker
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              ● Works offline
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50 sm:text-4xl">
            Create and track your work bucket list
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
            Add your work goals, mark progress, and copy a clean status report directly into Outlook.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg leading-none transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Overall Completion</p>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-200">{summary.progress}%</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {summary.done} done out of {summary.total}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${summary.progress}%` }}
        />
      </div>

      {summary.overdue > 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
          ⚠ {summary.overdue} item{summary.overdue > 1 ? 's are' : ' is'} overdue
        </p>
      )}
    </section>
  )
}
