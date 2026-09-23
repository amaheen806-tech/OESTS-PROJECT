export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`mb-6 flex gap-1 border-b border-nude-200 ${className}`}>
      {tabs.map((tab) => {
        const key = tab.key || tab.id
        const label = tab.label
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-gold-500 text-nude-900'
                : 'border-transparent text-nude-500 hover:text-nude-700'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
