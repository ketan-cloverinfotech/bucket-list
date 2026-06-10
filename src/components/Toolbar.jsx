import { priorityOptions, sortOptions, statusOptions } from '../lib.js'
import { input } from './ui.jsx'

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

export default function Toolbar({
  items,
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortKey,
  setSortKey,
}) {
  const countStatus = (s) => items.filter((i) => i.status === s).length
  const countPriority = (p) => items.filter((i) => i.priority === p).length

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <input
          className={input}
          placeholder="Search by work item, category, or notes"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select className={input} value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Sort items">
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</span>
        <Chip active={statusFilter === 'All'} onClick={() => setStatusFilter('All')}>
          All ({items.length})
        </Chip>
        {statusOptions.map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s} ({countStatus(s)})
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Priority</span>
        <Chip active={priorityFilter === 'All'} onClick={() => setPriorityFilter('All')}>
          All
        </Chip>
        {priorityOptions.map((p) => (
          <Chip key={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)}>
            {p} ({countPriority(p)})
          </Chip>
        ))}
      </div>
    </div>
  )
}
