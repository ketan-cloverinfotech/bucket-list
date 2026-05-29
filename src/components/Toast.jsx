export default function Toast({ message, onUndo, onClose }) {
  if (!message) return null
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl dark:bg-slate-700">
        <span>{message}</span>
        {onUndo && (
          <button onClick={onUndo} className="font-bold text-blue-300 hover:text-blue-200">
            Undo
          </button>
        )}
        <button onClick={onClose} aria-label="Dismiss" className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}
