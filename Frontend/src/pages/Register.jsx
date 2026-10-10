// src/AuthForm.jsx
// Login + Sign up page (React + React Router + Tailwind)
import { useState } from "react";
import { Link } from "react-router-dom";
import { request, ROUTES } from "./api";

const labelClass =
  "block text-sm font-mono font-bold uppercase tracking-wider text-[#7A7062]";

const inputClass =
  "block w-full rounded-xl border border-[#E0D8CC] bg-white px-4 py-3 text-base text-[#1C1815] shadow-sm placeholder:text-gray-400 focus:border-[#f26522] focus:outline-none focus:ring-1 focus:ring-[#f26522]";

function Field({ id, label, ...props }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  );
}

function Tab({ to, active, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex w-1/2 items-center justify-center rounded-full text-lg font-semibold transition-colors ${
        active
          ? "bg-[#f26522] text-white shadow-md"
          : "text-[#7A7062] hover:bg-[#f26522] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default function AuthForm({ mode = "login", onAuth }) {
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (password.length < 6) {
        return setError("Password must be at least 6 characters");
      }
      if (password !== passwordConfirm) {
        return setError("Passwords do not match");
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await request(ROUTES.login, { method: "POST", body: { email, password } });
      } else {
        // The backend creates the account and sets the login cookie
        await request(ROUTES.register, {
          method: "POST",
          body: {
            name: name.trim(),
            email,
            password,
            confirmPassword: confirmPassword,
          },
        });
      }
      await onAuth(); // App re-checks the session via /me, then redirects to "/"
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#14100E] px-6 py-12">
      <div className="flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#2A2420] bg-[#1C1815] shadow-2xl lg:flex-row">
        {/* Left side: brand panel (hidden on small screens) */}
        <div className="hidden flex-col justify-between p-12 text-[#F5EFE6] lg:flex lg:w-1/2">
          <span className="text-2xl font-semibold tracking-tight">Taskly</span>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight">
              Get today's tasks out of your head.
            </h1>
            <p className="max-w-sm text-base text-[#B8AE9E]">
              Add what needs doing, tick it off, and pick up where you left off on any device.
            </p>
          </div>

          <p className="text-sm text-[#7A7062]">Your tasks stay private to your account.</p>
        </div>

        {/* Right side: form */}
        <div className="flex w-full items-center justify-center bg-[#F5EFE6] p-8 text-[#1C1815] lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            {/* Tabs: Log in / Sign up */}
            <div className="mb-8 flex h-16 rounded-full bg-[#E8E2D5] p-2">
              <Tab to="/login" active={isLogin}>
                Log in
              </Tab>
              <Tab to="/register" active={!isLogin}>
                Sign up
              </Tab>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-100 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <Field
                  id="name"
                  label="Full name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <Field
                id="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Field
                id="password"
                label="Password"
                type="password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {!isLogin && (
                <Field
                  id="confirmPassword"
                  label="Confirm password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-[#1C1815] px-4 py-3.5 text-lg font-semibold text-white shadow-md transition-all hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#1C1815] focus:ring-offset-2 disabled:opacity-50"
              >
                {loading
                  ? isLogin
                    ? "Logging in..."
                    : "Creating account..."
                  : isLogin
                    ? "Log in"
                    : "Sign up"}
              </button>
            </form>

            <p className="mt-6 text-center text-base text-[#7A7062]">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <Link
                to={isLogin ? "/register" : "/login"}
                className="font-medium text-[#C1442E] hover:underline"
              >
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}