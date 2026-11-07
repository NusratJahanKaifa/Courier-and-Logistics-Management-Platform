
import { Link } from 'react-router-dom'
import Logo from './Logo'
import {
  FaLocationDot,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
} from 'react-icons/fa6'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#102A43] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">

        {/* Brand */}
        <div>
          <Link to="/" aria-label="CourierConnect home" className="mb-4 inline-flex">
            <Logo textClassName="text-white" />
          </Link>

          <p className="max-w-xs text-sm leading-7 text-slate-400">
            Your trusted courier and logistics partner. Book parcels,
            track deliveries, and stay updated throughout the journey.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-semibold text-white">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-2 transition-colors hover:text-teal-400"
              >
                <FaArrowRight className="text-xs text-teal-400" />
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 transition-colors hover:text-teal-400"
              >
                <FaArrowRight className="text-xs text-teal-400" />
                Track Parcel
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 transition-colors hover:text-teal-400"
              >
                <FaArrowRight className="text-xs text-teal-400" />
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 transition-colors hover:text-teal-400"
              >
                <FaArrowRight className="text-xs text-teal-400" />
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-5 text-lg font-semibold text-white">
            Our Services
          </h3>

          <ul className="space-y-3 text-sm">
            <li className="transition-colors hover:text-teal-400">
              Parcel Booking
            </li>
            <li className="transition-colors hover:text-teal-400">
              Parcel Tracking
            </li>
            <li className="transition-colors hover:text-teal-400">
              Delivery Management
            </li>
            <li className="transition-colors hover:text-teal-400">
              Shipment Status Updates
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-lg font-semibold text-white">
            Contact Us
          </h3>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <FaLocationDot className="mt-1 shrink-0 text-teal-400" />
              <span>Chattogram, Bangladesh</span>
            </li>

            <li className="flex items-start gap-3">
              <FaEnvelope className="mt-1 shrink-0 text-teal-400" />
              <a
                href="mailto:support@courierconnect.com"
                className="break-all transition-colors hover:text-teal-400"
              >
                support@courierconnect.com
              </a>
            </li>

            <li className="flex items-start gap-3">
              <FaPhone className="mt-1 shrink-0 text-teal-400" />
              <span>Contact support for assistance</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left lg:px-10">
          <p>
            © {currentYear} CourierConnect. All rights reserved.
          </p>

          <p>
            Designed with <span className="text-teal-400">♥</span> for
            better deliveries.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
