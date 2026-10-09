import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";

/* ------------------------------------------------------------------ */
/*  API CONFIG - change these to match your backend routes             */
/* ------------------------------------------------------------------ */
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ROUTES = {
  login: "/api/auth/login", // POST { email, password } -> { token }
  register: "/api/auth/register", // POST { email, password }
  todos: "/api/tasks", // GET, POST { title }
  todo: (id) => `/api/tasks/${id}`, // PUT { completed } / DELETE
};

/* ------------------------------------------------------------------ */
/*  Small fetch helper that adds the JWT and parses errors             */
/* ------------------------------------------------------------------ */
async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

/* ------------------------------------------------------------------ */
/*  Auth form (used by both /login and /register)                      */
/* ------------------------------------------------------------------ */
function AuthForm({ mode, onAuth }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isLogin) {
        await request(ROUTES.register, { method: "POST", body: { email, password } });
      }
      const data = await request(ROUTES.login, { method: "POST", body: { email, password } });
      onAuth(data.token); // the route guard then redirects to "/"
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30";

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">
        {isLogin ? "Log in to your list" : "Create an account"}
      </h2>

      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={input}
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={input}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
      </button>

      <p className="text-center text-sm text-gray-600">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link
          to={isLogin ? "/register" : "/login"}
          className="font-medium text-teal-700 underline"
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Todo list                                                          */
/* ------------------------------------------------------------------ */
const FILTERS = ["all", "active", "done"];

function TodoList({ token, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fail = (err) => {
    // Expired or invalid token: send the person back to the login screen
    if (/token|unauthor|jwt/i.test(err.message)) return onLogout();
    setError(err.message);
  };

  useEffect(() => {
    request(ROUTES.todos, { token })
      .then((data) => setTodos(Array.isArray(data) ? data : data.todos || []))
      .catch(fail)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addTodo = async (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setError("");
    try {
      const created = await request(ROUTES.todos, { method: "POST", token, body: { title: text } });
      setTodos((prev) => [created.todo || created, ...prev]);
      setTitle("");
    } catch (err) {
      fail(err);
    }
  };

  const toggleTodo = async (todo) => {
    setError("");
    try {
      const updated = await request(ROUTES.todo(todo.id), {
        method: "PUT",
        token,
        body: { completed: !todo.completed },
      });
      const next = updated.todo || updated;
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, ...next, completed: !todo.completed } : t))
      );
    } catch (err) {
      fail(err);
    }
  };

  const deleteTodo = async (id) => {
    setError("");
    try {
      await request(ROUTES.todo(id), { method: "DELETE", token });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      fail(err);
    }
  };

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.completed : !t.completed
  );
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Today's tasks</h1>
          <p className="text-sm text-gray-600">
            {remaining === 0 ? "Nothing left to do" : `${remaining} left to finish`}
          </p>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-600 underline hover:text-gray-900">
          Log out
        </button>
      </header>

      <form onSubmit={addTodo} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          required
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
        />
        <button className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">
          Add task
        </button>
      </form>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {loading && <li className="text-sm text-gray-500">Loading your tasks...</li>}

        {!loading && visible.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500">
            {todos.length === 0 ? "No tasks yet. Add your first one above." : "No tasks in this view."}
          </li>
        )}

        {visible.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
          >
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={() => toggleTodo(todo)}
              aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
              className="h-4 w-4 accent-teal-700"
            />
            <span
              className={`flex-1 break-words ${
                todo.completed ? "text-gray-400 line-through" : "text-gray-900"
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete "${todo.title}"`}
              className="text-sm text-gray-400 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
function Card({ children }) {
  return <div className="w-full max-w-md rounded-2xl bg-gray-50 p-6 shadow-xl">{children}</div>;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleAuth = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-800 text-white">
        <Navbar />
        <main className="flex items-center justify-center p-4 pt-10">
          <Card>
            <Routes>
              {/* Home: only for logged-in users */}
              <Route
                path="/"
                element={
                  token ? (
                    <TodoList token={token} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Login / Register: logged-in users are sent to Home */}
              <Route
                path="/login"
                element={token ? <Navigate to="/" replace /> : <AuthForm mode="login" onAuth={handleAuth} />}
              />
              <Route
                path="/register"
                element={token ? <Navigate to="/" replace /> : <AuthForm mode="register" onAuth={handleAuth} />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Card>
        </main>
      </div>
    </Router>
  );
}

export default App;