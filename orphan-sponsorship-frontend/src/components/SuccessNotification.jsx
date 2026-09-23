import { useEffect, useState } from 'react'
import { CheckCircle2, LogIn, UserPlus, X } from 'lucide-react'

export const SUCCESS_NOTIFICATION_PRESETS = {
  login: {
    title: 'Welcome back!',
    message: 'You have logged in to your account successfully.',
    icon: LogIn,
  },
  register: {
    title: 'Account created!',
    message: 'Your account has been created successfully.',
    icon: UserPlus,
  },
  donate: {
    title: 'Donation recorded!',
    message: 'Thank you. Your sponsorship payment was successful.',
    icon: CheckCircle2,
  },
  approve: {
    title: 'Application approved',
    message: 'The orphan application has been approved successfully.',
    icon: CheckCircle2,
  },
  reject: {
    title: 'Application rejected',
    message: 'The orphan application has been rejected.',
    icon: CheckCircle2,
  },
  report: {
    title: 'Report submitted',
    message: 'The monthly school report was submitted successfully.',
    icon: CheckCircle2,
  },
  success: {
    title: 'Success!',
    message: 'Your action was completed successfully.',
    icon: CheckCircle2,
  },
}

export default function SuccessNotification({
  open = false,
  onClose,
  title,
  message,
  type = 'success',
  duration = 4000,
}) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const preset = SUCCESS_NOTIFICATION_PRESETS[type] || SUCCESS_NOTIFICATION_PRESETS.success
  const Icon = preset.icon
  const displayTitle = title || preset.title
  const displayMessage = message || preset.message

  useEffect(() => {
    if (!open) return

    setVisible(true)
    setLeaving(false)

    const timer = window.setTimeout(() => {
      closeNotification()
    }, duration)

    return () => window.clearTimeout(timer)
  }, [open, duration])

  function closeNotification() {
    setLeaving(true)
    window.setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      onClose?.()
    }, 280)
  }

  if (!open && !visible) return null

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] w-[min(100%,22rem)] sm:right-6 sm:top-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto overflow-hidden rounded-xl border border-emerald-200/80 bg-white shadow-soft ${
          leaving ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
      >
        <div className="flex gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon size={20} />
          </span>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-nude-900">{displayTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-nude-600">{displayMessage}</p>
          </div>

          <button
            type="button"
            onClick={closeNotification}
            className="shrink-0 rounded-lg p-1 text-nude-400 transition-colors hover:bg-nude-100 hover:text-nude-700"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-1 bg-emerald-100">
          <div
            className="h-full origin-left bg-emerald-500"
            style={{
              animation: open ? `notification-progress ${duration}ms linear forwards` : 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
