import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'ui-btn-primary',
  accent: 'ui-btn-accent',
  outline: 'ui-btn-outline',
  ghost: 'ui-btn-ghost',
  danger: 'ui-btn-danger',
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
