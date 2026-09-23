import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, ShieldCheck, HeartHandshake, TrendingUp, ArrowLeft } from 'lucide-react'

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Verified children',
    text: 'Every application is reviewed before donors can sponsor.',
  },
  {
    icon: HeartHandshake,
    title: 'Direct sponsorship',
    text: 'Donate to a specific child and receive a clear receipt.',
  },
  {
    icon: TrendingUp,
    title: 'Tracked progress',
    text: 'Monthly school reports keep everyone accountable.',
  },
]

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  beside = null,
  backTo = "/",
  backLabel = "Back to home"
}) {
  const location = useLocation()

  return (
    <div className="relative flex min-h-screen">
      {/* Soft page atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-nude-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(201,162,39,0.12),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(30,46,77,0.08),_transparent_50%)]" />

      {/* Brand panel */}
      <aside className="relative z-10 hidden w-[46%] flex-col justify-between overflow-hidden bg-nude-900 px-10 py-10 text-nude-50 lg:flex xl:px-14">
        {/* Soft glowing orbs */}
        <div className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

        <div key={location.pathname} className="relative">
          <Link to="/" className="inline-flex items-center gap-3 animate-auth-slide-left opacity-0" style={{ animationDelay: '0ms' }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-nude-900 ring-1 ring-gold-500/50">
              <GraduationCap size={24} className="text-gold-400" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Orphan Sponsorship</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold-400">OESTS</p>
            </div>
          </Link>

          <h2
            className="mt-14 max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl animate-auth-slide-left opacity-0"
            style={{ animationDelay: '100ms' }}
          >
            <span className="bg-gradient-to-r from-white via-gold-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
              Transparent education sponsorship
            </span>{' '}
            for orphan children
          </h2>
          <p
            className="mt-4 max-w-sm text-sm leading-relaxed text-nude-300 xl:text-base animate-auth-slide-left opacity-0"
            style={{ animationDelay: '200ms' }}
          >
            Connect verified orphans, partner schools, and donors on one platform — so every
            rupee reaches a real classroom.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, title, text }, idx) => (
              <li
                key={title}
                className="flex gap-3 animate-auth-slide-left opacity-0"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-nude-300">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p
          key={`footer-${location.pathname}`}
          className="relative text-xs text-nude-400 animate-auth-slide-left opacity-0"
          style={{ animationDelay: '600ms' }}
        >
          Education · Transparency · Trust
        </p>
      </aside>

      {/* Form panel */}
      <section className="relative z-10 flex flex-1 flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mb-6 flex items-center justify-between lg:mb-8">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-medium text-nude-600 transition-colors hover:text-nude-900"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>

          {/* Mobile brand */}
          <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nude-800 ring-1 ring-gold-500/40">
              <GraduationCap size={18} className="text-gold-400" />
            </span>
            <span className="text-sm font-semibold text-nude-900">OESTS</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center items-center">
          <div className="relative flex w-full max-w-md items-start lg:max-w-none lg:justify-center">
            {/* The Main Card */}
            <div className="animate-fade-up w-full max-w-md rounded-2xl border border-nude-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8 relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
              Secure access
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-nude-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-nude-500">{subtitle}</p>
            )}

            <div className="mt-7">{children}</div>

            {footer && (
              <div className="mt-7 border-t border-nude-100 pt-5 text-center text-sm text-nude-500">
                {footer}
              </div>
            )}
            </div>

            {/* Render beside content (like Role Selector) */}
            {beside && (
              <div className="mt-6 flex w-full justify-center lg:mt-0 lg:ml-6 lg:w-auto lg:items-stretch lg:justify-start">
                {beside}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-nude-400">
            Orphan Educational Sponsorship and Tracking System
          </p>
        </div>
      </section>
    </div>
  )
}
