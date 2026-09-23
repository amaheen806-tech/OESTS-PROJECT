import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  HeartHandshake,
  School,
  Baby,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import AuthLayout from '../components/ui/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import SuccessNotification from '../components/SuccessNotification'

// No role options needed on login

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessNotice, setShowSuccessNotice] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

    async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const response = await loginUser({ email, password })
      const { user, token } = response.data
      login(user, token)
      setShowSuccessNotice(true)
      window.setTimeout(() => redirectToDashboard(user.role), 2200)
    } catch (err) {
      const data = err.response?.data
      const message =
        data?.message ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        (typeof data === 'object' && data !== null
          ? Object.values(data).flat()?.[0]
          : null)

      if (!err.response) {
        setError('Could not connect to the server. Please make sure the backend is running.')
      } else {
        setError(message || 'Your email address or password is incorrect.')
      }
    } finally {
      setLoading(false)
    }
  }

  function redirectToDashboard(userRole) {
    if (userRole === 'admin') navigate('/admin-dashboard')
    else if (userRole === 'donor') navigate('/donor-portal')
    else if (userRole === 'school') navigate('/school-portal')
    else navigate('/orphan-application')
  }

  return (
    <>
      <SuccessNotification
        open={showSuccessNotice}
        type="login"
        onClose={() => setShowSuccessNotice(false)}
      />

      <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with your email and password to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-gold-600 hover:text-gold-500">
            Create one
          </Link>
        </>
      }
    >


      {error && (
        <Alert tone="error" className="mb-4">
          {error}
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
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-nude-700">Password</label>
          <div className="relative mb-1.5">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-nude-400"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="ui-input pl-9 pr-10 w-full"
              required
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-400 hover:text-nude-600 z-10"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-gold-600 hover:text-gold-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="accent" loading={loading} className="mt-1 w-full">
          {loading ? 'Logging in...' : 'Login to Account'}
        </Button>
      </form>
    </AuthLayout>
    </>
  )
}
