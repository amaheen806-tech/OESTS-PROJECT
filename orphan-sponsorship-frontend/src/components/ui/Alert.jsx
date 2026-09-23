const tones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-nude-200 bg-nude-50 text-nude-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

export default function Alert({ tone = 'info', children, className = '' }) {
  return (
    <div
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${tones[tone] || tones.info} ${className}`}
      role="alert"
    >
      {children}
    </div>
  )
}
