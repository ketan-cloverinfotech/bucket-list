// Reusable Tailwind class strings — centralised so light/dark stay consistent.
export const card =
  'rounded-3xl bg-white p-6 shadow-xl shadow-blue-100 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-slate-700'

export const panel =
  'rounded-2xl border border-slate-200 p-5 dark:border-slate-700'

export const subPanel =
  'rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50'

export const input =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/40'

export const labelText = 'mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300'

export const primaryBtn =
  'rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 dark:shadow-none'

export function SummaryCard({ title, value, description, accent }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${accent || 'text-slate-950 dark:text-slate-50'}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

export function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {children}
    </button>
  )
}
