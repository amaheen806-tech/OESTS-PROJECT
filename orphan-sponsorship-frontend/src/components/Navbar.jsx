import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

const BRAND = 'Orphan Sponsorship'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return undefined
    }

    function onScroll() {
      setScrolled(window.scrollY > 48)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  // Transparent only on home, near top of hero, and when mobile menu is closed
  const transparent = isHome && !scrolled && !menuOpen

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  function dashboardLink() {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin-dashboard'
    if (user.role === 'donor') return '/donor-portal'
    if (user.role === 'school') return '/school-portal'
    if (user.role === 'orphan') return '/orphan-application'
    return '/'
  }

  function navClass(path) {
    const active = pathname === path
    return `text-sm whitespace-nowrap transition-colors ${
      active
        ? 'font-semibold text-gold-400'
        : 'text-nude-100/90 hover:text-white'
    }`
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about-us', label: 'About Us' },
    { to: '/contact-us', label: 'Contact Us' },
    { to: '/feedback', label: 'Feedback' },
  ]

  return (
    <nav
      className={`top-0 z-50 text-nude-50 transition-all duration-300 ${
        isHome ? 'fixed inset-x-0' : 'sticky'
      } ${
        transparent
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-nude-700/60 bg-nude-800/95 shadow-[0_8px_24px_rgba(19,29,51,0.25)] backdrop-blur-md'
      }`}
    >
      <div className="page-container flex min-h-[3.75rem] items-center justify-between py-3 md:min-h-[4.25rem] md:py-3.5">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-gold-500/40 md:h-11 md:w-11 ${
              transparent ? 'bg-nude-900/40' : 'bg-nude-900'
            }`}
          >
            <GraduationCap size={22} className="text-gold-400" />
          </span>
          <span className="text-base md:text-lg whitespace-nowrap">{BRAND}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={navClass(link.to)}>
              {link.label}
            </Link>
          ))}

          {user && (
            <Link to={dashboardLink()} className={navClass(dashboardLink())}>
              Dashboard
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className={navClass('/login')}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-nude-900 hover:bg-gold-400"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <div
              className={`flex items-center gap-4 border-l pl-5 ${
                transparent ? 'border-white/25' : 'border-nude-600'
              }`}
            >
              <div className="text-right leading-tight">
                <p className="text-base font-medium text-white">
                  {user.fullName || user.full_name || 'User'}
                </p>
                <p className="text-xs capitalize text-nude-300">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base text-nude-100 ${
                  transparent ? 'hover:bg-white/10' : 'hover:bg-nude-700'
                } hover:text-white`}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`rounded-xl p-2.5 text-nude-100 md:hidden ${
            transparent ? 'hover:bg-white/10' : 'hover:bg-nude-700'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className={`flex flex-col gap-1.5 border-t px-4 py-4 md:hidden ${
            transparent
              ? 'border-white/15 bg-nude-900/80 backdrop-blur-md'
              : 'border-nude-700 bg-nude-800'
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-base whitespace-nowrap ${
                pathname === link.to ? 'bg-white/10 text-gold-400' : 'text-nude-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to={dashboardLink()}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-base text-nude-100"
            >
              Dashboard
            </Link>
          )}
          {!user && (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-nude-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-xl bg-gold-500 px-4 py-3 text-center text-base font-semibold text-nude-900"
              >
                Register
              </Link>
            </>
          )}
          {user && (
            <div className="mt-2 border-t border-white/15 pt-3">
              <p className="px-4 text-base font-medium">
                {user.fullName || user.full_name || 'User'}
              </p>
              <p className="px-4 text-sm capitalize text-nude-300">{user.role}</p>
              <Button
                variant="ghost"
                className="mt-2 w-full justify-start text-base text-nude-200"
                onClick={handleLogout}
              >
                <LogOut size={18} /> Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
