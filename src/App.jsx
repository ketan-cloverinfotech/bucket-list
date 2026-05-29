import { useMemo, useRef, useState } from 'react'
import { useBucketList } from './useBucketList.js'
import { normalizeItem, sortItems } from './lib.js'
import { TabButton } from './components/ui.jsx'
import Header from './components/Header.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import AddForm from './components/AddForm.jsx'
import Toolbar from './components/Toolbar.jsx'
import BucketTable from './components/BucketTable.jsx'
import OutlookPanel from './components/OutlookPanel.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  const bl = useBucketList()
  const [activeTab, setActiveTab] = useState('add')

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortKey, setSortKey] = useState('manual')

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Reorder only makes sense on the full, manually-ordered list.
  const canReorder =
    sortKey === 'manual' && statusFilter === 'All' && priorityFilter === 'All' && searchText.trim() === ''

  const visibleItems = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    const filtered = bl.items.filter((item) => {
      const matchesText =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter
      return matchesText && matchesStatus && matchesPriority
    })
    return sortItems(filtered, sortKey)
  }, [bl.items, searchText, statusFilter, priorityFilter, sortKey])

  function showToast(message, onUndo) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, onUndo })
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }

  function handleDelete(id) {
    const removed = bl.removeItem(id)
    if (!removed) return
    showToast('Deleted \u201C' + removed.item.title + '\u201D', () => {
      bl.restoreItem(removed.item, removed.index)
      setToast(null)
    })
  }

  function handleAdd(form) {
    const ok = bl.addItem(form)
    if (ok) setActiveTab('report')
    return ok
  }

  function handleImport(rawArray) {
    bl.replaceAll(rawArray.map(normalizeItem))
  }

  function handleClearAll() {
    if (window.confirm('This will delete all bucket list items from this browser. Continue?')) bl.clearAll()
  }

  function handleLoadSample() {
    if (window.confirm('This will replace your current list with sample items. Continue?')) bl.loadSample()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-4 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <Header summary={bl.summary} />
        <SummaryCards summary={bl.summary} />

        {bl.saveError && (
          <p className="mb-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
            Could not save to this browser. Storage may be full or blocked (private mode). Export a JSON backup to be safe.
          </p>
        )}

        <section className="rounded-3xl bg-white p-4 shadow-xl shadow-blue-100 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-slate-700 sm:p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <TabButton active={activeTab === 'add'} onClick={() => setActiveTab('add')}>
              Add Bucket Item
            </TabButton>
            <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')}>
              Bucket Report
            </TabButton>
            <TabButton active={activeTab === 'outlook'} onClick={() => setActiveTab('outlook')}>
              Copy for Outlook
            </TabButton>
          </div>

          {activeTab === 'add' && (
            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <AddForm onAdd={handleAdd} />

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Current bucket list</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Use checkbox to mark any item as completed.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleLoadSample}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-700"
                    >
                      Load Sample
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <BucketTable
                  rows={bl.items}
                  updateItem={bl.updateItem}
                  toggleDone={bl.toggleDone}
                  onDelete={handleDelete}
                  reorder={bl.reorder}
                  canReorder
                />
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div>
              <Toolbar
                items={bl.items}
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                sortKey={sortKey}
                setSortKey={setSortKey}
              />

              <BucketTable
                rows={visibleItems}
                updateItem={bl.updateItem}
                toggleDone={bl.toggleDone}
                onDelete={handleDelete}
                reorder={bl.reorder}
                canReorder={canReorder}
              />

              <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report summary</h3>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  Your work bucket list is <b>{bl.summary.progress}% completed</b>. Completed items show ✅, in-progress 🟡,
                  pending ⬜. Showing {visibleItems.length} of {bl.items.length} item{bl.items.length === 1 ? '' : 's'}.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'outlook' && (
            <OutlookPanel
              items={bl.items}
              summary={bl.summary}
              name={bl.name}
              setName={bl.setName}
              onImport={handleImport}
            />
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Saved automatically in this browser · Works offline · Do not store passwords, tokens, or client-confidential data.
        </footer>
      </div>

      <Toast message={toast?.message} onUndo={toast?.onUndo} onClose={() => setToast(null)} />
    </main>
  )
}
