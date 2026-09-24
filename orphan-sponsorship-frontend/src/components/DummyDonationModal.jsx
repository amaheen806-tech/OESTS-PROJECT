import { useEffect, useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, X } from 'lucide-react'
import { makeDonation } from '../services/api'
import Button from './ui/Button'
import Input from './ui/Input'
import Alert from './ui/Alert'
import { digitsOnly } from '../utils/inputMasks'

export default function DummyDonationModal({ open, orphan, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return

    setAmount('')
    setScreenshot(null)
    setScreenshotPreview(null)
    setError('')
    setLoading(false)
    setSuccess(false)

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

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setScreenshotPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const donationAmount = Number(amount)

    if (!donationAmount || donationAmount <= 0) {
      setError('Please enter a donation amount greater than zero.')
      return
    }
    
    if (!screenshot) {
      setError('Please attach the payment screenshot.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('orphan', orphan.id)
      formData.append('amount', donationAmount)
      formData.append('payment_screenshot', screenshot)

      const response = await makeDonation(formData)

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.({
          amount: donationAmount,
          orphanName: name,
          receiptNumber: response.data?.receiptNumber,
        })
        onClose?.()
      }, 3000)
    } catch (err) {
      const data = err.response?.data
      const firstError = data ? Object.values(data).flat()?.[0] : null
      setError(
        data?.message ||
          (typeof firstError === 'string' ? firstError : null) ||
          'Could not submit the donation. Please try again.'
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
                JazzCash Transfer
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

        {success ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <CheckCircle size={48} className="text-green-500" />
            <h3 className="text-xl font-bold text-nude-900">Payment Successfully Submitted!</h3>
            <p className="text-sm text-nude-600">
              Your donation request has been successfully submitted and is pending admin approval. You will also receive a confirmation email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="rounded-xl border border-gold-200 bg-gold-50/50 p-4">
              <h3 className="mb-2 text-sm font-bold text-nude-900">Payment Instructions</h3>
              <p className="text-sm text-nude-700 mb-4">
                Please transfer the donation amount to the following JazzCash account and upload the screenshot of the transaction below.
              </p>
              
              <div className="flex flex-col space-y-2 rounded-lg bg-white p-3 border border-nude-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-nude-600">Account Name:</span>
                  <span className="text-sm font-bold text-nude-900">Esha Irfan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-nude-600">Account Number:</span>
                  <span className="text-sm font-bold text-nude-900">03229790810</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-nude-600">Bank/Provider:</span>
                  <span className="text-sm font-bold text-nude-900">JazzCash</span>
                </div>
              </div>
            </div>

            <Input
              label="Donation amount (PKR)"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(digitsOnly(e.target.value, 8))}
              placeholder="e.g. 5000"
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-nude-900">
                Payment Screenshot
              </label>
              
              <div 
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors hover:bg-nude-50 ${
                  screenshot ? 'border-gold-300 bg-gold-50/30' : 'border-nude-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange} 
                />
                
                {screenshotPreview ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={screenshotPreview} 
                      alt="Preview" 
                      className="mb-3 max-h-32 rounded-lg object-contain" 
                    />
                    <p className="text-sm font-medium text-nude-900">{screenshot.name}</p>
                    <p className="mt-1 text-xs text-gold-600 underline">Click to change screenshot</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 rounded-full bg-nude-100 p-3">
                      <Upload size={24} className="text-nude-600" />
                    </div>
                    <p className="text-sm font-medium text-nude-900">
                      Click to upload screenshot
                    </p>
                    <p className="mt-1 text-xs text-nude-500">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <div className="flex flex-col gap-2 sm:flex-row pt-2">
              <Button type="submit" variant="accent" loading={loading} className="flex-1">
                {loading ? 'Submitting...' : `Submit Payment`}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
