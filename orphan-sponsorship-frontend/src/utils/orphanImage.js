/**
 * Resolve a display image for an orphan card/modal.
 * Prefers the API photo URL, then a name-matched public image, then a default.
 */
export function getOrphanImage(orphan) {
  if (!orphan) return '/default-orphan.jpg'
  if (orphan.image) return orphan.image

  const name = (orphan.name || orphan.full_name || '').trim().toLowerCase()
  if (!name) return '/default-orphan.jpg'

  const slug = name.replace(/\s+/g, '-')
  const known = {
    'eman-fatima': '/eman-fatima.jpg',
    'muhammad-ali': '/muhammad-ali.jpg',
    'hamza-ahmed': '/hamza-ahmed.jpg',
    'amina-noor': '/amina-noor.jpg',
    'yusuf-khan': '/yusuf-khan.jpg',
    'hira-sheikh': '/hira-sheikh.jpg',
    'hassan-raza': '/hassan-raza.jpg',
    'maryam-bibi': '/maryam-bibi.jpg',
  }

  return known[slug] || `/${slug}.jpg`
}

export function orphanImageFallback(event) {
  if (event?.target && event.target.src && !event.target.src.endsWith('/default-orphan.jpg')) {
    event.target.src = '/default-orphan.jpg'
  }
}
