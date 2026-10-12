// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { request, ROUTES } from "../api";

const labelClass = "block text-sm font-medium text-gray-700";
const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30";

export default function Login({ onAuth }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Read values straight from the form so browser autofill is always captured
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") || "").toString().trim();
    const password = (form.get("password") || "").toString();

    if (!email || !password) {
      return setError("Please enter your email and password");
    }

    setLoading(true);
    try {
      await request(ROUTES.login, {
        method: "POST",
        body: { email, password },
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
            aria-current="page"
            className="flex w-1/2 items-center justify-center rounded-full bg-teal-700 py-2 text-sm font-medium text-white shadow-sm"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="flex w-1/2 items-center justify-center rounded-full py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
          >
            Sign up
          </Link>
        </div>

        <h1 className="mb-5 text-2xl font-semibold text-gray-900">Log in to your list</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
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
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          New here?{" "}
          <Link to="/register" className="font-medium text-teal-700 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}