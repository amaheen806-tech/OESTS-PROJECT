import { CheckCircle2 } from 'lucide-react'
import Button from './ui/Button'
import { getOrphanImage, orphanImageFallback } from '../utils/orphanImage'

export default function OrphanCard({
  orphan,
  actionLabel,
  onAction,
  secondaryAction,
  onCardClick,
  elevated = false,
}) {
  const name = orphan.name || orphan.full_name || 'Child'
  const className = orphan.className || orphan.student_class || '—'
  const school = orphan.school || orphan.school_name_text || '—'
  const verified = orphan.verified !== false
  const imageSrc = getOrphanImage(orphan)

  const cardClass = elevated
    ? 'group ui-card-elevated flex flex-col overflow-hidden'
    : 'group ui-card flex flex-col overflow-hidden transition-shadow hover:shadow-md'

  function handleCardClick(e) {
    if (!onCardClick) return
    if (e.target.closest('button')) return
    onCardClick(orphan)
  }

  return (
    <div
      className={`${cardClass} ${onCardClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCardClick(orphan)
              }
            }
          : undefined
      }
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
    >
      <div className="orphan-card-media flex h-56 w-full items-center justify-center overflow-hidden bg-nude-100 sm:h-60">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-contain object-center"
          onError={orphanImageFallback}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-nude-900">{name}</h3>
          {verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] font-semibold text-gold-600">
              <CheckCircle2 size={12} /> Verified
            </span>
          )}
        </div>

        <p className="text-sm text-nude-600">
          {orphan.age != null ? `Age ${orphan.age} · ` : ''}Class {className}
        </p>
        <p className="text-sm text-nude-500">{school}</p>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          {actionLabel && (
            <Button variant="primary" className="w-full" onClick={() => onAction?.(orphan)}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      </div>
    </div>
  )
}
