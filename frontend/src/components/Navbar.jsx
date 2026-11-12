
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import {
  FaBars,
  FaXmark,
  FaHouse,
  FaMagnifyingGlass,
  FaGauge,
  FaUsers,
  FaPlus
} from 'react-icons/fa6'

function Navbar() {
  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('access_token')
  )
  const [role, setRole] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('access_token')
      let user = {}

      try {
        user = JSON.parse(localStorage.getItem('user') || '{}')
      } catch {
        user = {}
      }

      setIsLoggedIn(!!token)
      setRole(user.role || '')
    }

    checkLogin()

    window.addEventListener('storage', checkLogin)
    window.addEventListener('auth-change', checkLogin)

    return () => {
      window.removeEventListener('storage', checkLogin)
      window.removeEventListener('auth-change', checkLogin)
    }
  }, [])

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
      isActive
        ? 'bg-teal-700 font-semibold text-white'
        : 'text-slate-200 hover:bg-white/10 hover:text-white'
    }`

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    setIsLoggedIn(false)
    setRole('')
    setMenuOpen(false)

    window.dispatchEvent(new Event('auth-change'))
    navigate('/login')
  }

  const navLinks = (
    <>
      <li>
        <NavLink to="/" end className={linkStyle} onClick={closeMenu}>
          <FaHouse /> Home
        </NavLink>
      </li>

      <li>
        <NavLink to="/track" className={linkStyle} onClick={closeMenu}>
          <FaMagnifyingGlass /> Track Parcel
        </NavLink>
      </li>

      {isLoggedIn && role.toLowerCase() === 'admin' && (
        <>
          <li>
            <NavLink to="/admin" className={linkStyle} onClick={closeMenu}>
              <FaGauge /> Admin Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/users-management"
              className={linkStyle}
              onClick={closeMenu}
            >
              <FaUsers /> Manage Users
            </NavLink>
          </li>
        </>
      )}

      {isLoggedIn && role.toLowerCase() !== 'admin' && (
        <>
          <li>
            <NavLink to="/dashboard" className={linkStyle} onClick={closeMenu}>
              <FaGauge /> My Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/book-parcel"
              className={linkStyle}
              onClick={closeMenu}
            >
              <FaPlus /> Book a Parcel
            </NavLink>
          </li>
        </>
      )}
    </>
  )

  const authButtons = (
    <>
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
           className="btn btn-sm min-h-10 border border-teal-400/60 bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 sm:btn-md"
        >
          Logout
        </button>
      ) : (
        <>
          <Link
            to="/login"
            onClick={closeMenu}
            className="btn btn-sm min-h-10 border border-teal-400 bg-transparent px-4 font-semibold text-white hover:bg-teal-700 sm:btn-md"
          >
            Login
          </Link>

          <Link
            to="/signup"
            onClick={closeMenu}
            className="btn btn-sm min-h-10 border-none bg-teal-600 px-4 font-semibold text-white shadow-md hover:bg-teal-700 sm:btn-md"
          >
            Get Started
          </Link>
        </>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102A43] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">

        {/* Main Navbar Row */}
        <div className="flex min-h-[72px] items-center justify-between gap-2">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="CourierConnect home"
            className="min-w-0 shrink"
          >
            <Logo
              markClassName="h-9 w-9 rounded-lg sm:h-10 sm:w-10"
              textClassName="text-base text-white sm:text-lg md:text-xl"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex"
            aria-label="Main navigation"
          >
            <ul className="menu menu-horizontal items-center gap-1 px-1">
              {navLinks}
            </ul>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {authButtons}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-square btn-ghost shrink-0 text-white hover:bg-white/10 lg:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <FaXmark className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Auth Buttons - Outside Menu */}
        <div className="flex w-full gap-3 pb-3 lg:hidden">
          {authButtons}
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <nav
            className="border-t border-white/10 py-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="menu w-full gap-1 p-0">
              {navLinks}
            </ul>
          </nav>
        )}

      </div>
    </header>
  )
}

export default Navbar
