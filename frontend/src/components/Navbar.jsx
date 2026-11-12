
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("access_token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      setIsLoggedIn(!!token);
      setRole(user.role || "");
    };

    updateAuth();

    window.addEventListener("storage", updateAuth);
    window.addEventListener("auth-change", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("auth-change", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setRole("");
    setMenuOpen(false);

    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-teal-400"
        : "text-gray-200 hover:text-teal-400"
    }`;

  const navLinks = (
    <>
      <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>

      <NavLink
        to="/track"
        className={linkClass}
        onClick={() => setMenuOpen(false)}
      >
        Track Parcel
      </NavLink>

      {isLoggedIn && role === "admin" && (
        <>
          <NavLink
            to="/admin"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Admin Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Manage Users
          </NavLink>
        </>
      )}

      {isLoggedIn && role !== "admin" && (
        <>
          <NavLink
            to="/dashboard"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            My Dashboard
          </NavLink>

          <NavLink
            to="/book-parcel"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Book a Parcel
          </NavLink>
        </>
      )}
    </>
  );

  const authButtons = isLoggedIn ? (
    <button
      onClick={handleLogout}
      className="btn btn-sm min-h-8 border border-teal-400/60 bg-teal-700 px-2 text-xs font-semibold text-white hover:bg-teal-800 sm:px-3 sm:text-sm"
    >
      Logout
    </button>
  ) : (
    <>
      <Link
        to="/login"
        className="btn btn-sm min-h-8 border border-teal-400 bg-transparent px-2 text-xs font-semibold text-white hover:bg-teal-700 sm:px-3 sm:text-sm"
      >
        Login
      </Link>

      <Link
        to="/signup"
        className="btn btn-sm min-h-8 border-none bg-teal-600 px-2 text-xs font-semibold text-white hover:bg-teal-700 sm:px-3 sm:text-sm"
      >
        Get Started
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102A43] shadow-md">
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* Main Navbar Row */}
        <div className="flex min-h-[56px] items-center justify-between gap-1">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <Logo
              markClassName="h-8 w-8 rounded-lg"
              textClassName="text-base text-white"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-5 lg:flex">
            {navLinks}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {authButtons}
          </div>

          {/* Mobile Auth Buttons */}
          <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
            {authButtons}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-400/50 text-white hover:bg-teal-700 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="flex flex-col gap-4 border-t border-white/10 py-4 lg:hidden">
            {navLinks}
          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;
