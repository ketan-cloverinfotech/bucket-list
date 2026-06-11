import { SummaryCard } from './ui.jsx'

export default function SummaryCards({ summary }) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <SummaryCard title="Total Items" value={summary.total} description="All bucket list items" />
      <SummaryCard
        title="Done"
        value={summary.done}
        description="Completed items"
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        title="In Progress"
        value={summary.inProgress}
        description="Currently active"
        accent="text-amber-600 dark:text-amber-400"
      />
      <SummaryCard
        title="On Hold"
        value={summary.onHold}
        description="Paused / waiting"
        accent="text-violet-600 dark:text-violet-400"
      />
      <SummaryCard
        title={summary.overdue > 0 ? 'Overdue' : 'Not Started'}
        value={summary.overdue > 0 ? summary.overdue : summary.notStarted}
        description={summary.overdue > 0 ? 'Past target date' : 'Yet to begin'}
        accent={summary.overdue > 0 ? 'text-red-600 dark:text-red-400' : undefined}
      />
    </section>
  )
}
