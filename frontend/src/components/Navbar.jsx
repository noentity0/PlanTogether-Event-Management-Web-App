import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm transition ${
    isActive ? "bg-accent text-appbg" : "bg-field text-textmuted hover:bg-[#333333] hover:text-textmain"
  }`;

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-appbg/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-light text-lg font-bold text-appbg">
            P
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              PlanTogether
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-textmuted">Create. Discover. Gather.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            Explore
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/create" className={navLinkClass}>
                Create Event
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-white/10 bg-field px-4 py-2 text-sm text-textmuted sm:block">
                {user?.name || user?.email}
              </div>
              <button type="button" onClick={handleLogout} className="button-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button-secondary">
                Login
              </Link>
              <Link to="/register" className="button-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-4 md:hidden sm:px-6 lg:px-8">
        <NavLink to="/" className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/explore" className={navLinkClass}>
          Explore
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/create" className={navLinkClass}>
              Create
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
