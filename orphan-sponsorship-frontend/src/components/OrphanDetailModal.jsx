import { useEffect } from 'react'
import { X, CheckCircle2, GraduationCap, MapPin, School, User } from 'lucide-react'
import Button from './ui/Button'
import { getOrphanImage, orphanImageFallback } from '../utils/orphanImage'

export default function OrphanDetailModal({ open, onClose, orphan, onSponsor }) {
  useEffect(() => {
    if (!open) return

    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !orphan) return null

  const name = orphan.name || orphan.full_name || 'Child'
  const className = orphan.className || orphan.student_class || '—'
  const school = orphan.school || orphan.school_name_text || '—'
  const verified = orphan.verified !== false
  const imageSrc = getOrphanImage(orphan)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nude-900/55 px-4 py-6 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg animate-modal-in overflow-hidden rounded-2xl border border-nude-200/80 bg-white shadow-[0_24px_60px_rgba(19,29,51,0.2)]">
        <div className="relative flex h-64 items-center justify-center bg-nude-100 sm:h-72">
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-contain object-center"
            onError={orphanImageFallback}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nude-900/70 via-transparent to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 text-nude-600 shadow-sm transition-colors hover:bg-white hover:text-nude-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white sm:text-2xl">{name}</h2>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-nude-900">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[calc(90vh-16rem)] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {orphan.age != null && (
              <DetailItem icon={User} label="Age" value={`${orphan.age} years`} />
            )}
            <DetailItem icon={GraduationCap} label="Class" value={`Class ${className}`} />
            <DetailItem icon={School} label="School" value={school} />
            {orphan.location && (
              <DetailItem icon={MapPin} label="Location" value={orphan.location} />
            )}
          </div>

          {orphan.bio && (
            <div className="mt-5 rounded-xl border border-nude-100 bg-nude-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                About
              </p>
              <p className="mt-2 text-sm leading-relaxed text-nude-600">{orphan.bio}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {onSponsor && (
              <Button variant="accent" className="flex-1" onClick={() => onSponsor(orphan)}>
                Sponsor Now
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-nude-100 bg-white p-3 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-nude-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-nude-900">{value}</p>
      </div>
    </div>
  )
}
