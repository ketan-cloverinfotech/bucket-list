import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadState,
  saveState,
  makeSampleItems,
  sortItems,
  dueState,
} from './lib.js'

/**
 * Single source of truth for the bucket list.
 * Owns: items, the report sender name, persistence, derived summary,
 * filtering/sorting, and every mutating action.
 */
export function useBucketList() {
  const initial = useRef(loadState()).current
  const [items, setItems] = useState(initial.items)
  const [name, setName] = useState(initial.name)
  const [saveError, setSaveError] = useState(false)

  // Persist on any change. Debounced lightly so rapid typing in inline
  // editors doesn't hammer localStorage.
  useEffect(() => {
    const id = setTimeout(() => {
      const ok = saveState({ items, name })
      setSaveError(!ok)
    }, 200)
    return () => clearTimeout(id)
  }, [items, name])

  const summary = useMemo(() => {
    const total = items.length
    const done = items.filter((i) => i.status === 'Done').length
    const inProgress = items.filter((i) => i.status === 'In Progress').length
    const notStarted = items.filter((i) => i.status === 'Not Started').length
    const overdue = items.filter((i) => dueState(i.targetDate, i.status) === 'overdue').length
    const progress = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, inProgress, notStarted, overdue, progress }
  }, [items])

  // --- mutations -----------------------------------------------------------
  const addItem = useCallback((form) => {
    const title = form.title.trim()
    if (!title) return false
    const newItem = {
      id: crypto.randomUUID(),
      title,
      category: form.category.trim() || 'General',
      priority: form.priority,
      status: form.status,
      targetDate: form.targetDate,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    }
    setItems((cur) => [newItem, ...cur])
    return true
  }, [])

  const updateItem = useCallback((id, field, value) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }, [])

  const toggleDone = useCallback((id) => {
    setItems((cur) =>
      cur.map((i) =>
        i.id === id ? { ...i, status: i.status === 'Done' ? 'Not Started' : 'Done' } : i,
      ),
    )
  }, [])

  /** Removes an item and returns {item, index} so the caller can offer Undo. */
  const removeItem = useCallback((id) => {
    let removed = null
    setItems((cur) => {
      const index = cur.findIndex((i) => i.id === id)
      if (index === -1) return cur
      removed = { item: cur[index], index }
      return cur.filter((i) => i.id !== id)
    })
    return removed
  }, [])

  const restoreItem = useCallback((item, index) => {
    setItems((cur) => {
      const copy = [...cur]
      copy.splice(Math.min(index, copy.length), 0, item)
      return copy
    })
  }, [])

  /** Manual drag reorder: move dragId to the position of targetId. */
  const reorder = useCallback((dragId, targetId) => {
    if (dragId === targetId) return
    setItems((cur) => {
      const from = cur.findIndex((i) => i.id === dragId)
      const to = cur.findIndex((i) => i.id === targetId)
      if (from === -1 || to === -1) return cur
      const copy = [...cur]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }, [])

  const loadSample = useCallback(() => setItems(makeSampleItems()), [])
  const clearAll = useCallback(() => setItems([]), [])

  const replaceAll = useCallback((next) => setItems(next), [])

  return {
    items,
    setItems,
    name,
    setName,
    saveError,
    summary,
    sortItems, // re-exported for convenience
    addItem,
    updateItem,
    toggleDone,
    removeItem,
    restoreItem,
    reorder,
    loadSample,
    clearAll,
    replaceAll,
  }
}
