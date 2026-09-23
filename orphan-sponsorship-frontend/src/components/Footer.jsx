import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

const BRAND = 'Orphan Sponsorship'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-nude-700/40 bg-nude-800 text-nude-200">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-nude-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nude-900 ring-1 ring-gold-500/40">
              <GraduationCap size={18} className="text-gold-400" />
            </span>
            {BRAND}
          </div>
          <p className="text-sm leading-relaxed text-nude-300">
            Connecting orphan children, schools, NGOs, and donors on one transparent
            platform, so every donation directly supports a child&apos;s education.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-nude-50">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-sm text-nude-300">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact-us" className="hover:text-white">Contact Us</Link></li>
            <li><Link to="/feedback" className="hover:text-white">Feedback</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-nude-50">Get Involved</h3>
          <ul className="flex flex-col gap-2 text-sm text-nude-300">
            <li><Link to="/register" className="hover:text-white">Become a Donor</Link></li>
            <li><Link to="/register" className="hover:text-white">Register Your School</Link></li>
            <li><Link to="/register" className="hover:text-white">Apply for Sponsorship</Link></li>
            <li><Link to="/login" className="hover:text-white">Login to Your Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-nude-50">Contact</h3>
          <ul className="flex flex-col gap-3 text-sm text-nude-300">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-gold-400" />
              <a href="mailto:info@oests.org" className="hover:text-white">
                info@oests.org
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-gold-400" />
              <a href="tel:+9242111123456" className="hover:text-white">
                +92 42 111 123 456
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
              University Road, Lahore, Pakistan
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-nude-700">
        <div className="page-container flex flex-col items-center justify-between gap-2 py-4 text-xs text-nude-400 sm:flex-row">
          <p>
            © {year} Orphan Educational Sponsorship and Tracking System. All rights reserved.
          </p>
          <p>Academic demo project · OESTS</p>
        </div>
      </div>
    </footer>
  )
}
