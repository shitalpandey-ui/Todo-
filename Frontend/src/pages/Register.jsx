// src/pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { request, ROUTES } from "../api";

const labelClass = "block text-sm font-medium text-gray-700";
const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30";

export default function Register({ onAuth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (password !== passwordConfirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // The backend creates the account AND sets the login cookie
      await request(ROUTES.register, {
        method: "POST",
        body: {
          name: name.trim(),
          email,
          password,
          confirmPassword: passwordConfirm,
        },
      });
      await onAuth(); // App re-checks the session, then redirects to "/"
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 p-6 shadow-xl">
        {/* Tabs */}
        <div className="mb-6 flex rounded-full bg-gray-200 p-1">
          <Link
            to="/login"
            className="flex w-1/2 items-center justify-center rounded-full py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link
            to="/register"
            aria-current="page"
            className="flex w-1/2 items-center justify-center rounded-full bg-teal-700 py-2 text-sm font-medium text-white shadow-sm"
          >
            Sign up
          </Link>
        </div>

        <h1 className="mb-5 text-2xl font-semibold text-gray-900">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className={labelClass}>
              Confirm password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal-700 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}