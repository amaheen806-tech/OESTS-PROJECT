import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Mail } from 'lucide-react'
import { sendOTP, verifyOTP } from '../services/api'
import AuthLayout from '../components/ui/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import SuccessNotification from '../components/SuccessNotification'

function readPendingRegistration(locationState) {
  if (locationState?.email && locationState?.password) {
    return locationState
  }
  try {
    const raw = sessionStorage.getItem('oests_pending_registration')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()

  const registration = useMemo(
    () => readPendingRegistration(location.state),
    [location.state]
  )

  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessNotice, setShowSuccessNotice] = useState(false)

  useEffect(() => {
    if (!registration) {
      navigate('/register', { replace: true })
    }
  }, [registration, navigate])

  if (!registration) {
    return null
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!otpCode.trim()) {
      setError('Please enter the verification code sent to your email.')
      return
    }

    setLoading(true)
    try {
      await verifyOTP({
        ...registration,
        otp_code: otpCode.trim(),
      })
      sessionStorage.removeItem('oests_pending_registration')
      setShowSuccessNotice(true)
      window.setTimeout(() => navigate('/login', { replace: true }), 2200)
    } catch (err) {
      const responseData = err.response?.data
      const firstError = responseData ? Object.values(responseData)[0] : null
      setError(
        Array.isArray(firstError)
          ? firstError[0]
          : responseData?.message || 'Could not verify the code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await sendOTP(registration)
      setInfo('A new verification code has been sent to your email.')
    } catch (err) {
      setError('Could not resend the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SuccessNotification
        open={showSuccessNotice}
        type="register"
        message="Your account has been created successfully. Redirecting you to login..."
        onClose={() => setShowSuccessNotice(false)}
        duration={4500}
      />

      <AuthLayout
        title="Verify Your Email"
        subtitle="Enter the 6-digit code we sent to complete your registration."
        footer={
          <>
            Wrong details?{' '}
            <Link to="/register" className="font-semibold text-gold-600 hover:text-gold-500">
              Go back to register
            </Link>
          </>
        }
      >
        <div className="mb-5 rounded-xl border border-nude-100 bg-nude-50/80 px-4 py-3 text-sm text-nude-600">
          <div className="flex items-center gap-2 font-medium text-nude-800">
            <Mail size={16} className="text-gold-600" />
            Code sent to
          </div>
          <p className="mt-1 break-all">{registration.email}</p>
        </div>

        {error && (
          <Alert tone="error" className="mb-4">
            {error}
          </Alert>
        )}
        {info && (
          <Alert tone="success" className="mb-4">
            {info}
          </Alert>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Input
            label="Verification Code"
            icon={KeyRound}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit code"
            maxLength={6}
            hint="The code expires in 10 minutes."
            className="tracking-[0.35em]"
            autoFocus
          />

          <Button type="submit" variant="accent" loading={loading} className="w-full">
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </Button>

          <Button type="button" variant="ghost" onClick={handleResend} disabled={loading}>
            Resend code
          </Button>
        </form>
      </AuthLayout>
    </>
  )
}
