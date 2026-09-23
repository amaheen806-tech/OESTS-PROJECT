import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-nude-200 bg-nude-50/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nude-100 text-nude-500">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-nude-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-nude-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
