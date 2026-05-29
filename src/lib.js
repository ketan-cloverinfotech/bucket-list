// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const STORAGE_KEY = 'work-bucket-list-v2'
export const OLD_STORAGE_KEY = 'work-bucket-list-v1' // migrate data from the old version
export const THEME_KEY = 'wbl-theme'

export const statusOptions = ['Not Started', 'In Progress', 'Done']
export const priorityOptions = ['Low', 'Medium', 'High']

export const sortOptions = [
  { value: 'manual', label: 'Manual order' },
  { value: 'priority', label: 'Priority (High → Low)' },
  { value: 'date', label: 'Target date (soonest)' },
  { value: 'status', label: 'Status' },
  { value: 'created', label: 'Recently added' },
]

export function makeSampleItems() {
  const now = new Date().toISOString()
  return [
    {
      id: crypto.randomUUID(),
      title: 'Create GitHub repo for AI project',
      category: 'GitHub / AI',
      priority: 'High',
      status: 'Not Started',
      targetDate: '',
      notes: 'Create repo, add README, add initial folder structure.',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Pass AZ-204 exam',
      category: 'Certification',
      priority: 'High',
      status: 'In Progress',
      targetDate: '',
      notes: 'Prepare Azure developer topics and practice questions.',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'SBOM generation for JIO',
      category: 'Security / DevSecOps',
      priority: 'Medium',
      status: 'Not Started',
      targetDate: '',
      notes: 'Generate SBOM and prepare report for dependency visibility.',
      createdAt: now,
    },
  ]
}

export const emptyForm = {
  title: '',
  category: '',
  priority: 'Medium',
  status: 'Not Started',
  targetDate: '',
  notes: '',
}

// ---------------------------------------------------------------------------
// Storage (with safe parsing + one-time migration from the v1 bare-array format)
// ---------------------------------------------------------------------------
export function normalizeItem(item) {
  return {
    id: item.id || crypto.randomUUID(),
    title: item.title || 'Untitled item',
    category: item.category || 'General',
    priority: priorityOptions.includes(item.priority) ? item.priority : 'Medium',
    status: statusOptions.includes(item.status) ? item.status : 'Not Started',
    targetDate: item.targetDate || '',
    notes: item.notes || '',
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

export function loadState() {
  // Preferred: v2 structured store { version, items, name }
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY)
    if (rawV2) {
      const parsed = JSON.parse(rawV2)
      if (parsed && Array.isArray(parsed.items)) {
        return { items: parsed.items.map(normalizeItem), name: parsed.name || '' }
      }
    }
  } catch {
    /* fall through */
  }

  // Migration: old v1 stored a bare array under a different key.
  try {
    const rawV1 = localStorage.getItem(OLD_STORAGE_KEY)
    if (rawV1) {
      const parsed = JSON.parse(rawV1)
      if (Array.isArray(parsed)) {
        return { items: parsed.map(normalizeItem), name: '' }
      }
    }
  } catch {
    /* fall through */
  }

  // First run.
  return { items: makeSampleItems(), name: '' }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...state }))
    return true
  } catch {
    // Most common cause: storage full or blocked (private mode / disabled).
    return false
  }
}

// ---------------------------------------------------------------------------
// Dates & due state
// ---------------------------------------------------------------------------
export function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Returns 'overdue' | 'soon' | 'normal' | 'none'. "soon" = within 7 days. */
export function dueState(targetDate, status) {
  if (!targetDate || status === 'Done') return 'none'
  const due = new Date(targetDate + 'T00:00')
  if (Number.isNaN(due.getTime())) return 'none'
  const today = todayStart()
  const days = Math.round((due - today) / 86400000)
  if (days < 0) return 'overdue'
  if (days <= 7) return 'soon'
  return 'normal'
}

export function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value + 'T00:00')
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Visual class helpers (light + dark)
// ---------------------------------------------------------------------------
export function getStatusIcon(status) {
  if (status === 'Done') return '✅'
  if (status === 'In Progress') return '🟡'
  return '⬜'
}

export function getPriorityClass(priority) {
  if (priority === 'High') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
  if (priority === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
}

export function getStatusClass(status) {
  if (status === 'Done') return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30'
  if (status === 'In Progress') return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30'
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
}

export function dueBadgeClass(state) {
  if (state === 'overdue') return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
  if (state === 'soon') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  return ''
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------
const priorityRank = { High: 0, Medium: 1, Low: 2 }
const statusRank = { 'In Progress': 0, 'Not Started': 1, Done: 2 }

export function sortItems(items, sortKey) {
  if (sortKey === 'manual') return items
  const copy = [...items]
  copy.sort((a, b) => {
    if (sortKey === 'priority') return priorityRank[a.priority] - priorityRank[b.priority]
    if (sortKey === 'status') return statusRank[a.status] - statusRank[b.status]
    if (sortKey === 'created') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortKey === 'date') {
      // Items without a date sink to the bottom.
      if (!a.targetDate && !b.targetDate) return 0
      if (!a.targetDate) return 1
      if (!b.targetDate) return -1
      return new Date(a.targetDate) - new Date(b.targetDate)
    }
    return 0
  })
  return copy
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function csvCell(value) {
  const s = String(value ?? '')
  // Quote if it contains comma, quote, or newline; escape inner quotes.
  if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"'
  return s
}

export function toCSV(items) {
  const header = ['No.', 'Work Item', 'Category', 'Priority', 'Status', 'Target Date', 'Notes']
  const rows = items.map((item, i) =>
    [i + 1, item.title, item.category, item.priority, item.status, item.targetDate || '', item.notes || '']
      .map(csvCell)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Outlook report
// ---------------------------------------------------------------------------
export function buildOutlookHtml(items, summary, name) {
  const signature = name?.trim() || 'Me'
  const rows = items
    .map(
      (item, index) => `
        <tr>
          <td style="border:1px solid #d9e2ec;padding:8px;">${index + 1}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${escapeHtml(item.title)}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${escapeHtml(item.category || '-')}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${escapeHtml(item.priority)}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${getStatusIcon(item.status)} ${escapeHtml(item.status)}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${escapeHtml(item.targetDate || '-')}</td>
          <td style="border:1px solid #d9e2ec;padding:8px;">${escapeHtml(item.notes || '-')}</td>
        </tr>`,
    )
    .join('')

  return `
    <div style="font-family:Calibri,Arial,sans-serif;color:#111827;">
      <p>Hi Team,</p>
      <p>Please find my work bucket list status below.</p>
      <p><b>Overall Completion:</b> ${summary.progress}% completed (${summary.done}/${summary.total} done)</p>
      <table style="border-collapse:collapse;width:100%;font-family:Calibri,Arial,sans-serif;font-size:14px;">
        <thead>
          <tr style="background:#eaf2ff;">
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">No.</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Work Bucket Item</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Category</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Priority</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Status</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Target Date</th>
            <th style="border:1px solid #d9e2ec;padding:8px;text-align:left;">Notes</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" style="border:1px solid #d9e2ec;padding:8px;">No items added.</td></tr>'}</tbody>
      </table>
      <p>Regards,<br/>${escapeHtml(signature)}</p>
    </div>`
}

export function buildOutlookText(items, summary, name) {
  const signature = name?.trim() || 'Me'
  const rows = items
    .map(
      (item, index) =>
        `${index + 1}. ${getStatusIcon(item.status)} ${item.title} | Category: ${item.category || '-'} | Priority: ${item.priority} | Status: ${item.status} | Target: ${item.targetDate || '-'} | Notes: ${item.notes || '-'}`,
    )
    .join('\n')

  return `Hi Team,\n\nPlease find my work bucket list status below.\n\nOverall Completion: ${summary.progress}% completed (${summary.done}/${summary.total} done)\n\n${rows || 'No items added.'}\n\nRegards,\n${signature}`
}
