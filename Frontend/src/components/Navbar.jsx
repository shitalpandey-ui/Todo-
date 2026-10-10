import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  return (
    <header className="border-b border-gray-700 bg-gray-900">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          Taskly
        </Link>

        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-gray-400 sm:inline">{user.email}</span>
            <button
              onClick={onLogout}
              className="text-gray-300 underline hover:text-white"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-gray-300 hover:text-white">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}