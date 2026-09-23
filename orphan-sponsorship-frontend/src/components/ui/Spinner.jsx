import { Loader2 } from 'lucide-react'

export default function Spinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <Loader2 size={28} className="animate-spin text-gold-500" />
      {label && <p className="text-sm text-nude-500">{label}</p>}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`ui-card animate-pulse p-4 ${className}`}>
      <div className="mb-3 h-32 rounded-lg bg-nude-100" />
      <div className="mb-2 h-4 w-2/3 rounded bg-nude-100" />
      <div className="h-3 w-1/2 rounded bg-nude-100" />
    </div>
  )
}
