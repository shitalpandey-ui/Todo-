import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToAbout = () => {
    const scroll = () =>
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });

    if (location.pathname === "/") {
      scroll();
    } else {
      // go to the home page first, then scroll once it has rendered
      navigate("/");
      setTimeout(scroll, 100);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          Taskly
        </Link>

        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-gray-400 sm:inline">{user.name}</span>
            <button
              onClick={scrollToAbout}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:text-white"
            >
              About us
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:text-white"
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