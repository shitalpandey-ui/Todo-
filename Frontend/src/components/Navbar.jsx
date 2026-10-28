import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Toggle theme"
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-teal-600"
    >
      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform dark:translate-x-6" />
    </button>
  );
}

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToAbout = () => {
    const scroll = () =>
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });

    if (location.pathname === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 100);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
        >
          Taskly
        </Link>

        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-2xl font-semibold text-gray-900 dark:text-white sm:inline">
              {user.name}
            </span>
            <button
              onClick={scrollToAbout}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-gray-100 shadow-sm hover:bg-teal-800 hover:text-white"
            >
              About us
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-gray-100 shadow-sm hover:bg-teal-800 hover:text-white"
            >
              Log out
            </button>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800"
            >
              Sign up
            </Link>
            <ThemeToggle />
          </div>
        )}
      </nav>
    </header>
  );
}