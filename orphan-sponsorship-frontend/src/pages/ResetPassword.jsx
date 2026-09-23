import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { resetPassword } from '../services/api'
import AuthLayout from '../components/ui/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(uid, token, password)
      setMessage('Your password has been reset successfully. You can now login.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const responseData = err.response?.data
      const firstError = responseData ? Object.values(responseData)[0] : null
      setError(
        Array.isArray(firstError)
          ? firstError[0]
          : responseData?.message || 'This reset link is invalid or has expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Choose a strong new password for your account."
      footer={
        <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-500">
          Back to Login
        </Link>
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
          label="New Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          hint="Must include a letter, a number, and a symbol."
        />
        <Input
          label="Confirm New Password"
          icon={Lock}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
        />
        <Button type="submit" variant="accent" loading={loading} className="mt-1 w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
