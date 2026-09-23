const styles = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-emerald-100 text-emerald-800',
  Accepted: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-700',
  Paid: 'bg-emerald-100 text-emerald-800',
  Failed: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const color = styles[status] || 'bg-nude-100 text-nude-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}
