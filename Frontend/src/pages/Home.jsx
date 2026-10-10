// src/pages/Home.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { request, ROUTES } from "../api";

const FILTERS = ["all", "active", "done"];

export default function Home({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fail = (err) => {
    // Expired or missing session: send the person back to the login screen
    if (err.status === 401) return onLogout();
    setError(err.message);
  };

  useEffect(() => {
    request(ROUTES.todos)
      .then((data) => setTodos(Array.isArray(data) ? data : data.todos || []))
      .catch(fail)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setError("");
    try {
      const created = await request(ROUTES.todos, { method: "POST", body: { title: text } });
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
      await request(ROUTES.todo(id), { method: "DELETE" });
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
    <div className="min-h-screen bg-gray-800 text-white">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex items-center justify-center p-4 pt-10">
        <div className="w-full max-w-md space-y-5 rounded-2xl bg-gray-50 p-6 shadow-xl">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">Today's tasks</h1>
            <p className="text-sm text-gray-600">
              {remaining === 0 ? "Nothing left to do" : `${remaining} left to finish`}
            </p>
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
                {todos.length === 0
                  ? "No tasks yet. Add your first one above."
                  : "No tasks in this view."}
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
      </main>
    </div>
  );
}