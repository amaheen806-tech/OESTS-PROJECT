import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { forgotPassword } from '../services/api'
import AuthLayout from '../components/ui/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email)
      setMessage(
        'If an account exists with this email, a password reset link has been sent. ' +
          'Since this is a development version, check the backend terminal window for the reset link.'
      )
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we’ll send a secure link to reset your password."
      footer={
        <>
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-500">
            Back to Login
          </Link>
        </>
      }
    >
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      {message && (
        <Alert tone="success" className="mb-4">
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" variant="accent" loading={loading} className="mt-1 w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </AuthLayout>
  )
}
