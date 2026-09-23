import { Routes, Route, useLocation, matchPath } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import DonorPortal from './pages/DonorPortal'
import SchoolPortal from './pages/SchoolPortal'
import OrphanApplication from './pages/OrphanApplication'
import ProgressReport from './pages/ProgressReport'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Feedback from './pages/Feedback'
import NotFound from './pages/NotFound'

const FULL_BLEED = ['/', '/about-us', '/contact-us', '/feedback']
const FULL_WIDTH = ['/admin-dashboard']

const AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password/:uid/:token',
]

function isAuthRoute(pathname) {
  return AUTH_PATHS.some((pattern) => matchPath({ path: pattern, end: true }, pathname))
}

function App() {
  const { pathname } = useLocation()
  const isAuth = isAuthRoute(pathname)
  const isAdmin = pathname.startsWith('/admin-dashboard')
  const hideNavAndFooter = isAuth || isAdmin
  const isFullBleed = FULL_BLEED.includes(pathname)
  const isFullWidth = FULL_WIDTH.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-nude-50 font-sans text-base text-nude-900">
      {!hideNavAndFooter && <Navbar />}

      <main
        className={`flex-1 ${
          isAuth
            ? ''
            : isFullBleed
              ? ''
              : isFullWidth
                ? 'w-full px-0 py-0'
                : 'page-container py-8 md:py-10'
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donor-portal"
            element={
              <ProtectedRoute allowedRole="donor">
                <DonorPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school-portal"
            element={
              <ProtectedRoute allowedRole="school">
                <SchoolPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orphan-application"
            element={
              <ProtectedRoute allowedRole="orphan">
                <OrphanApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress-report/:orphanId"
            element={
              <ProtectedRoute>
                <ProgressReport />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideNavAndFooter && <Footer />}
    </div>
  )
}

export default App
