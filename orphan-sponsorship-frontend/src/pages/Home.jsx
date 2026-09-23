import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartHandshake,
  ShieldCheck,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getFeaturedOrphans,
  getPublicStats,
  subscribeNewsletter,
} from '../services/api'
import OrphanCard from '../components/OrphanCard'
import OrphanDetailModal from '../components/OrphanDetailModal'
import DummyDonationModal from '../components/DummyDonationModal'
import SuccessNotification from '../components/SuccessNotification'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Reveal from '../components/Reveal'

const STAT_IMAGES = {
  verifiedOrphans: '/stat-orphans.jpg',
  activeDonors: '/stat-donors.jpg',
  partnerSchools: '/stat-schools.jpg',
  donationsRaised: '/stat-donations.jpg',
}

const steps = [
  { title: 'Register', text: 'Create your donor account in minutes.' },
  { title: 'Browse', text: 'View verified orphan profiles.' },
  { title: 'Donate', text: 'Choose a child and sponsor their education.' },
  { title: 'Track', text: 'Monitor progress with monthly reports.' },
]

function formatRaised(amount) {
  const value = Number(amount) || 0
  if (value >= 1000000) return `PKR ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `PKR ${Math.round(value / 1000)}K`
  return `PKR ${value.toLocaleString()}`
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribeError, setSubscribeError] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [selectedOrphan, setSelectedOrphan] = useState(null)
  const [donateOrphan, setDonateOrphan] = useState(null)
  const [featuredOrphans, setFeaturedOrphans] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [stats, setStats] = useState([])
  const [showSuccessNotice, setShowSuccessNotice] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadHomeData() {
      setLoadingFeatured(true)
      try {
        const [orphansRes, statsRes] = await Promise.all([
          getFeaturedOrphans(),
          getPublicStats(),
        ])
        setFeaturedOrphans(Array.isArray(orphansRes.data) ? orphansRes.data : [])
        const s = statsRes.data || {}
        setStats([
          {
            key: 'verifiedOrphans',
            label: 'Verified Orphans',
            value: String(s.verifiedOrphans ?? 0),
            image: STAT_IMAGES.verifiedOrphans,
          },
          {
            key: 'activeDonors',
            label: 'Active Donors',
            value: String(s.activeDonors ?? 0),
            image: STAT_IMAGES.activeDonors,
          },
          {
            key: 'partnerSchools',
            label: 'Partner Schools',
            value: String(s.partnerSchools ?? 0),
            image: STAT_IMAGES.partnerSchools,
          },
          {
            key: 'donationsRaised',
            label: 'Donations Raised',
            value: formatRaised(s.donationsRaised),
            image: STAT_IMAGES.donationsRaised,
          },
        ])
      } catch (err) {
        console.error('Could not load homepage data', err)
        setFeaturedOrphans([])
        setStats([
          { key: 'verifiedOrphans', label: 'Verified Orphans', value: '0', image: STAT_IMAGES.verifiedOrphans },
          { key: 'activeDonors', label: 'Active Donors', value: '0', image: STAT_IMAGES.activeDonors },
          { key: 'partnerSchools', label: 'Partner Schools', value: '0', image: STAT_IMAGES.partnerSchools },
          { key: 'donationsRaised', label: 'Donations Raised', value: 'PKR 0', image: STAT_IMAGES.donationsRaised },
        ])
      } finally {
        setLoadingFeatured(false)
      }
    }
    loadHomeData()
  }, [])

  async function handleSubscribe(e) {
    e.preventDefault()
    setSubscribeError('')
    setSubscribed(false)
    if (!email.trim()) {
      setSubscribeError('Please enter your email address.')
      return
    }

    setSubscribing(true)
    try {
      const response = await subscribeNewsletter(email.trim())
      if (response.data?.already_subscribed) {
        setSubscribeError(response.data.message || 'You are already subscribed.')
        return
      }
      setSubscribed(true)
      setEmail('')
    } catch (err) {
      const data = err.response?.data
      const status = err.response?.status
      if (status === 409 || data?.already_subscribed) {
        setSubscribeError(data?.message || 'You are already subscribed.')
      } else {
        setSubscribeError(
          data?.email?.[0] || data?.message || 'Could not subscribe. Please try again.'
        )
      }
    } finally {
      setSubscribing(false)
    }
  }

  function handleSponsorClick(orphan) {
    setSelectedOrphan(null)

    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'donor') {
      navigate('/login')
      return
    }

    setDonateOrphan(orphan)
  }

  function handleDonationSuccess({ amount, orphanName }) {
    setSuccessMessage(
      `Your card details were accepted and PKR ${amount} has been sent to sponsor ${orphanName}. A thank-you email with your donation amount has been sent to your inbox.`
    )
    setShowSuccessNotice(true)
  }

  return (
    <div>
      <SuccessNotification
        open={showSuccessNotice}
        type="donate"
        title="Donation successful"
        message={successMessage}
        duration={6000}
        onClose={() => setShowSuccessNotice(false)}
      />

      <DummyDonationModal
        open={!!donateOrphan}
        orphan={donateOrphan}
        onClose={() => setDonateOrphan(null)}
        onSuccess={handleDonationSuccess}
      />

      <OrphanDetailModal
        open={!!selectedOrphan}
        orphan={selectedOrphan}
        onClose={() => setSelectedOrphan(null)}
        onSponsor={handleSponsorClick}
      />

      <section
        className="relative -mt-[3.75rem] min-h-[28rem] overflow-hidden bg-nude-800 bg-cover bg-center bg-no-repeat pt-[3.75rem] text-nude-50 md:-mt-[4.25rem] md:min-h-[34rem] md:pt-[4.25rem]"
      >
        <div
          className="absolute inset-0 origin-center bg-cover bg-center bg-no-repeat animate-hero-zoom"
          style={{ backgroundImage: "url('/hero-education.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-nude-900/45 via-nude-900/55 to-nude-900/75" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,39,0.18),_transparent_55%)] animate-pulse-soft" />
        <div className="page-container relative flex min-h-[28rem] flex-col items-center justify-center py-20 text-center md:min-h-[34rem] md:py-28">
          <p className="mb-4 animate-fade-up text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            Education · Transparency · Trust
          </p>
          <h1 className="mx-auto max-w-3xl animate-fade-up text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Empowering Orphan Children Through Education
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base text-nude-100 md:text-lg">
            Connect with verified orphan children, track educational progress, and make a
            real difference — transparently.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button variant="accent" className="px-6">
                Sponsor a Child
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-white/40 bg-white/5 text-nude-50 hover:bg-white/10"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container flex flex-col gap-16 py-14 md:py-16">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, index) => (
            <Reveal key={s.key || s.label} delay={index * 90}>
              <div className="ui-card-elevated stat-card-media overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <img src={s.image} alt={s.label} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-nude-900/85 via-nude-900/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-lg font-bold tracking-tight md:text-xl">{s.value}</p>
                    <p className="text-xs text-nude-200">{s.label}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        <Reveal>
          <section className="ui-card-elevated flex items-start gap-4 p-6 md:p-8">
            <div className="flex h-12 w-12 shrink-0 animate-soft-float items-center justify-center rounded-full bg-gold-500/15 text-gold-600 shadow-sm">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nude-900 md:text-2xl">Our Mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-nude-700 md:text-base">
                We bridge the gap between orphan children in need of educational support and
                compassionate donors who want to make a difference. Every child&apos;s progress
                is tracked and reported, so you always know your donation is working.
              </p>
            </div>
          </section>
        </Reveal>

        <section>
          <Reveal>
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-nude-900 md:text-2xl">
                  Featured Orphan Profiles
                </h2>
                <p className="text-sm text-nude-600">
                  Live approved profiles from the system — click to view details
                </p>
              </div>
              <Link to="/register" className="text-sm font-medium text-gold-600 hover:text-gold-500">
                Create a donor account →
              </Link>
            </div>
          </Reveal>

          {loadingFeatured && <Spinner label="Loading verified profiles..." />}

          {!loadingFeatured && featuredOrphans.length === 0 && (
            <EmptyState
              title="No approved orphans yet"
              message="Approved profiles will appear here after NGO admin review."
            />
          )}

          {!loadingFeatured && featuredOrphans.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {featuredOrphans.slice(0, 6).map((orphan, index) => (
                <Reveal key={orphan.id} delay={index * 80}>
                  <OrphanCard
                    orphan={orphan}
                    elevated
                    actionLabel="Sponsor Now"
                    onCardClick={setSelectedOrphan}
                    onAction={handleSponsorClick}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <section>
          <Reveal>
            <h2 className="text-center text-xl font-semibold text-nude-900 md:text-2xl">
              How It Works
            </h2>
            <p className="mb-10 mt-1 text-center text-sm text-nude-600">
              Four simple steps to start making a difference
            </p>
          </Reveal>

          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-1 flex-col items-center gap-4 md:flex-row">
                <Reveal delay={index * 100} className="w-full">
                  <div
                    className={`ui-card-elevated w-full p-5 text-center transition-all duration-500 ${
                      activeStep === index
                        ? 'border-gold-500/50 ring-2 ring-gold-500/25'
                        : 'opacity-90'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors duration-500 ${
                        activeStep === index
                          ? 'bg-gold-500 text-nude-900'
                          : 'bg-nude-100 text-nude-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-nude-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-nude-600">{step.text}</p>
                  </div>
                </Reveal>
                {index < steps.length - 1 && (
                  <ArrowRight
                    className="shrink-0 rotate-90 text-nude-300 transition-colors duration-500 md:rotate-0"
                    size={20}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <Reveal>
          <section className="ui-card-elevated rounded-xl bg-nude-100 p-6 text-center md:p-8">
            <h2 className="text-xl font-semibold text-nude-900 md:text-2xl">Stay Updated</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-nude-700">
              Get updates on new orphan profiles and stories of impact, straight to your inbox.
            </p>

            {subscribed && (
              <Alert tone="success" className="mx-auto mt-5 max-w-md text-left">
                Thanks for subscribing! A confirmation email has been sent to your inbox.
              </Alert>
            )}

            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                containerClassName="flex-1"
              />
              <Button type="submit" variant="primary" loading={subscribing}>
                Subscribe
              </Button>
            </form>

            {subscribeError && (
              <Alert tone="info" className="mx-auto mt-3 max-w-md text-left">
                {subscribeError}
              </Alert>
            )}
          </section>
        </Reveal>

        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, text: 'Secure and verified accounts' },
            { icon: ClipboardCheck, text: 'Verified orphan documents' },
            { icon: TrendingUp, text: 'Real-time progress tracking' },
          ].map(({ icon: Icon, text }, index) => (
            <Reveal key={text} delay={index * 100}>
              <div className="ui-card-elevated flex flex-col items-center gap-3 p-5 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500/10 text-gold-600 shadow-sm">
                  <Icon size={22} />
                </div>
                <p className="text-sm text-nude-700">{text}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </div>
    </div>
  )
}
