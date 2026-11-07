
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { FaBars, FaXmark, FaHouse, FaMagnifyingGlass, FaGauge, FaUsers, FaPlus } from 'react-icons/fa6'

function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'))
  const [role, setRole] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('access_token')
      let user = {}
      try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch { user = {} }
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
      isActive ? 'bg-teal-700 font-semibold text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
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
      <li><NavLink to="/" end className={linkStyle} onClick={closeMenu}><FaHouse /> Home</NavLink></li>
      <li><NavLink to="/track" className={linkStyle} onClick={closeMenu}><FaMagnifyingGlass /> Track Parcel</NavLink></li>
      {isLoggedIn && role.toLowerCase() === 'admin' && <>
        <li><NavLink to="/admin" className={linkStyle} onClick={closeMenu}><FaGauge /> Admin Dashboard</NavLink></li>
        <li><NavLink to="/users-management" className={linkStyle} onClick={closeMenu}><FaUsers /> Manage Users</NavLink></li>
      </>}
      {isLoggedIn && role.toLowerCase() !== 'admin' && <>
        <li><NavLink to="/dashboard" className={linkStyle} onClick={closeMenu}><FaGauge /> My Dashboard</NavLink></li>
        <li><NavLink to="/book-parcel" className={linkStyle} onClick={closeMenu}><FaPlus /> Book a Parcel</NavLink></li>
      </>}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102A43] text-white shadow-lg">
      <div className="navbar mx-auto max-w-7xl px-4 md:px-8">
        <div className="navbar-start">
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="btn btn-ghost mr-1 text-white hover:bg-white/10 lg:hidden" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}>
            {menuOpen ? <FaXmark className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
          <Link to="/" onClick={closeMenu} aria-label="CourierConnect home">
            <Logo
              markClassName="h-9 w-9 rounded-lg"
              textClassName="text-lg md:text-xl text-white"
            />
          </Link>
        </div>

        <nav className="navbar-center hidden lg:flex" aria-label="Main navigation">
          <ul className="menu menu-horizontal items-center gap-1 px-1">{navLinks}</ul>
        </nav>

        <div className="navbar-end gap-2">
          {isLoggedIn ? (
            <button type="button" onClick={handleLogout} className="btn btn-sm border border-white/30 bg-white/10 text-white hover:border-red-400 hover:bg-red-600 md:btn-md">Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm text-white hover:bg-white/10 md:btn-md">Login</Link>
              <Link to="/signup" className="btn btn-sm border-none bg-teal-600 text-white shadow-md hover:bg-teal-700 md:btn-md">Get Started</Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && <nav className="border-t border-white/10 bg-[#102A43] px-4 py-3 lg:hidden" aria-label="Mobile navigation"><ul className="menu w-full gap-1">{navLinks}</ul></nav>}
    </header>
  )
}

export default Navbar
