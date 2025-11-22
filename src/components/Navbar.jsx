
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggle } = useTheme();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const commonLinks = (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-purple-600 font-semibold" : "hover:text-purple-600"
        }
        onClick={() => setMenuOpen(false)}
      >
        Home
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive ? "text-purple-600 font-semibold" : "hover:text-purple-600"
        }
        onClick={() => setMenuOpen(false)}
      >
        Explore Artworks
      </NavLink>
    </>
  );

  const privateLinks = user && (
    <>
      <NavLink
        to="/add-artwork"
        className={({ isActive }) =>
          isActive ? "text-purple-600 font-semibold" : "hover:text-purple-600"
        }
        onClick={() => setMenuOpen(false)}
      >
        Add Artwork
      </NavLink>

      <NavLink
        to="/my-gallery"
        className={({ isActive }) =>
          isActive ? "text-purple-600 font-semibold" : "hover:text-purple-600"
        }
        onClick={() => setMenuOpen(false)}
      >
        My Gallery
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          isActive ? "text-purple-600 font-semibold" : "hover:text-purple-600"
        }
        onClick={() => setMenuOpen(false)}
      >
        My Favorites
      </NavLink>
    </>
  );

  return (
    <nav
      className={`shadow sticky top-0 z-50 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-xl text-purple-700"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          Artify
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {commonLinks}
          {privateLinks}
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1 border border-purple-600 rounded hover:bg-purple-50"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="focus:outline-none"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <img
                  src={user.photoURL || "/favicon.ico"}
                  alt={user.displayName || user.email || "user"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </button>

              {userMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded shadow-lg py-2 text-sm z-10 ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <div className="px-4 py-1 font-semibold">
                    {user.displayName || user.email}
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 rounded ${
                      theme === "dark"
                        ? "text-red-400 hover:bg-red-700"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggle}
            className={`ml-4 flex items-center gap-2 px-3 py-1 border rounded hover:bg-purple-50 focus:outline-none ${
              theme === "dark" ? "" : "text-purple-600"
            }`}
            aria-label="Toggle Theme"
            title={theme === "light" ? "Switch to dark" : "Switch to light"}
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m8.485-8.485h-1M4.515 12h-1m15.364 4.95l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1 border border-purple-600 rounded text-sm hover:bg-purple-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="focus:outline-none"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <img
                src={user.photoURL || "/favicon.ico"}
                alt={user.displayName || user.email || "user"}
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          )}

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`md:hidden px-4 py-3 space-y-2 border-t ${
            theme === "dark"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-200"
          }`}
        >
          {commonLinks}
          {privateLinks}
        </div>
      )}

      {/* Mobile User Dropdown */}
      {user && userMenuOpen && (
        <div
          className={`md:hidden px-4 py-3 space-y-2 border-t ${
            theme === "dark"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-200"
          }`}
        >
          <div className="font-semibold">{user.displayName || user.email}</div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-1 rounded text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
