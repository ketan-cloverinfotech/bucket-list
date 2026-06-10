import { useState } from 'react'
import {
  dueBadgeClass,
  dueState,
  getPriorityClass,
  getStatusClass,
  priorityOptions,
  statusOptions,
} from '../lib.js'

const cellInput =
  'w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-slate-900 outline-none focus:border-blue-300 focus:bg-white dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-900'

const th = 'whitespace-nowrap border-b border-slate-200 p-3 text-left dark:border-slate-600'
const td = 'border-b border-slate-100 p-3 dark:border-slate-700/60'

function DueBadge({ targetDate, status }) {
  const state = dueState(targetDate, status)
  if (state === 'overdue')
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${dueBadgeClass(state)}`}>Overdue</span>
  if (state === 'soon')
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${dueBadgeClass(state)}`}>Due soon</span>
  return null
}

export default function BucketTable({ rows, updateItem, toggleDone, onDelete, reorder, canReorder }) {
  const [dragId, setDragId] = useState(null)

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
        No bucket list items found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
      {!canReorder && (
        <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          Reordering is available when sort is “Manual order” and no filters/search are active.
        </p>
      )}
      <table className="w-full min-w-[900px] border-collapse bg-white text-sm dark:bg-slate-800">
        <thead>
          <tr className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {canReorder && <th className={th} aria-label="Reorder"></th>}
            <th className={`${th} text-center`}>Done</th>
            <th className={th}>Work Bucket Item</th>
            <th className={th}>Category</th>
            <th className={th}>Priority</th>
            <th className={th}>Status</th>
            <th className={th}>Target Date</th>
            <th className={th}>Notes</th>
            <th className={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => (
            <tr
              key={item.id}
              onDragOver={(e) => canReorder && e.preventDefault()}
              onDrop={() => {
                if (canReorder && dragId) reorder(dragId, item.id)
                setDragId(null)
              }}
              className={`align-top transition hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                dragId === item.id ? 'opacity-40' : ''
              }`}
            >
              {canReorder && (
                <td className={`${td} w-16`}>
                  <div className="flex items-center gap-1">
                    <span
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragEnd={() => setDragId(null)}
                      title="Drag to reorder"
                      className="cursor-grab select-none px-1 text-slate-400 active:cursor-grabbing dark:text-slate-500"
                    >
                      ⠿
                    </span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => i > 0 && reorder(item.id, rows[i - 1].id)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="text-xs leading-none text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => i < rows.length - 1 && reorder(item.id, rows[i + 1].id)}
                        disabled={i === rows.length - 1}
                        aria-label="Move down"
                        className="text-xs leading-none text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
              )}

              <td className={`${td} w-14 text-center`}>
                <input
                  type="checkbox"
                  checked={item.status === 'Done'}
                  onChange={() => toggleDone(item.id)}
                  aria-label={`Mark "${item.title}" as done`}
                  className="mx-auto block h-5 w-5 rounded border-slate-300 accent-blue-600"
                />
              </td>

              <td className={`${td} min-w-[220px]`}>
                <input
                  className={`${cellInput} font-semibold ${item.status === 'Done' ? 'text-slate-400 line-through dark:text-slate-500' : ''}`}
                  value={item.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                />
              </td>

              <td className={`${td} min-w-[130px]`}>
                <input className={cellInput} value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)} />
              </td>

              <td className={td}>
                <select
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getPriorityClass(item.priority)}`}
                  value={item.priority}
                  onChange={(e) => updateItem(item.id, 'priority', e.target.value)}
                >
                  {priorityOptions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </td>

              <td className={td}>
                <select
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(item.status)}`}
                  value={item.status}
                  onChange={(e) => updateItem(item.id, 'status', e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </td>

              <td className={td}>
                <div className="flex flex-col items-start gap-1">
                  <input
                    type="date"
                    className="w-[150px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none focus:border-blue-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    value={item.targetDate}
                    onChange={(e) => updateItem(item.id, 'targetDate', e.target.value)}
                  />
                  <DueBadge targetDate={item.targetDate} status={item.status} />
                </div>
              </td>

              <td className={`${td} min-w-[200px]`}>
                <textarea
                  rows="2"
                  className={`${cellInput} resize-none`}
                  value={item.notes}
                  onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                />
              </td>

              <td className={`${td} whitespace-nowrap`}>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
