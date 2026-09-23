/** Keep only digits, optionally capped to max length. */
export function digitsOnly(value, maxLength) {
  const digits = String(value || '').replace(/\D/g, '')
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits
}

/** Pakistani mobile: exactly 11 digits, e.g. 03112233445 */
export function isValidPhone11(phone) {
  return /^\d{11}$/.test(String(phone || '').trim())
}

/**
 * Format CNIC as XXXXX-XXXXXXX-X while typing (13 digits total).
 */
export function formatCnic(value) {
  const digits = digitsOnly(value, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

export function cnicDigits(value) {
  return digitsOnly(value, 13)
}

export function isValidCnic13(value) {
  return /^\d{13}$/.test(cnicDigits(value))
}
