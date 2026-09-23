import { useEffect, useState } from 'react'
import { CreditCard, Lock, X } from 'lucide-react'
import { makeDonation } from '../services/api'
import Button from './ui/Button'
import Input from './ui/Input'
import Alert from './ui/Alert'
import { digitsOnly } from '../utils/inputMasks'

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function DummyDonationModal({ open, orphan, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setAmount('')
    setCardName('')
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setError('')
    setLoading(false)

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

  const name = orphan.name || orphan.full_name || 'this child'
  const school = orphan.school || orphan.school_name_text || ''
  const className = orphan.className || orphan.student_class || ''

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const donationAmount = Number(amount)
    const digits = cardNumber.replace(/\s/g, '')

    if (!donationAmount || donationAmount <= 0) {
      setError('Please enter a donation amount greater than zero.')
      return
    }
    if (!cardName.trim()) {
      setError('Please enter the name on the card.')
      return
    }
    if (digits.length !== 16) {
      setError('Please enter a valid 16-digit card number.')
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Please enter expiry as MM/YY.')
      return
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Please enter a valid CVV.')
      return
    }

    setLoading(true)
    try {
      // Card fields stay on the frontend only — never sent to the backend.
      const response = await makeDonation({
        orphan: orphan.id,
        amount: donationAmount,
      })

      onSuccess?.({
        amount: donationAmount,
        orphanName: name,
        receiptNumber: response.data?.receiptNumber,
      })
      onClose?.()
    } catch (err) {
      const data = err.response?.data
      const firstError = data ? Object.values(data).flat()?.[0] : null
      setError(
        data?.message ||
          (typeof firstError === 'string' ? firstError : null) ||
          'Could not complete the donation. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nude-900/55 px-4 py-6 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose?.()
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg animate-modal-in overflow-y-auto rounded-2xl border border-nude-200/80 bg-white shadow-[0_24px_60px_rgba(19,29,51,0.2)]">
        <div className="border-b border-nude-100 bg-nude-800 px-5 py-4 text-nude-50 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                Secure donation
              </p>
              <h2 className="mt-1 text-lg font-semibold sm:text-xl">Sponsor {name}</h2>
              {(school || className) && (
                <p className="mt-1 text-sm text-nude-300">
                  {[school, className ? `Class ${className}` : null].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1.5 text-nude-300 transition-colors hover:bg-nude-700 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <Input
            label="Donation amount (PKR)"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(digitsOnly(e.target.value, 8))}
            placeholder="e.g. 5000"
          />

          <div className="rounded-xl border border-nude-200 bg-nude-50/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-nude-800">
              <CreditCard size={16} className="text-gold-600" />
              Credit / Debit card
            </div>

            <div className="flex flex-col gap-3">
              <Input
                label="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Full name as on card"
              />
              <Input
                label="Card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="ACCT-000035"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry (MM/YY)"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                <Input
                  label="CVV"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-nude-500">
              <Lock size={12} />
              Demo payment form for UI — card details are not stored on the server.
            </p>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" variant="accent" loading={loading} className="flex-1">
              {loading ? 'Processing...' : `Donate${amount ? ` PKR ${amount}` : ''}`}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
