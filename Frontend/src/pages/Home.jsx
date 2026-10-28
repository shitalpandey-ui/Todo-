import { useEffect, useId, useState } from "react";
import Navbar from "../components/Navbar";
import About from "../components/About";
import { request, ROUTES } from "../api";

const STATUSES = ["all", "active", "done"];
const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };
const PRIORITY_STYLE = {
  high: { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", bar: "border-l-red-500" },
  medium: { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", bar: "border-l-amber-400" },
  low: { badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", bar: "border-l-sky-400" },
};
const DATE_FILTERS = [
  ["any", "Any date"],
  ["overdue", "Overdue"],
  ["today", "Due today"],
  ["week", "Next 7 days"],
  ["none", "No due date"],
];
const SORTS = [
  ["created", "Newest first"],
  ["due", "Due date"],
  ["priority", "Priority"],
  ["manual", "Manual order"],
];
const ORDER_KEY = "todo-manual-order";
const DAY = 86400000;
const EMPTY_FORM = { title: "", dueDate: "", dueTime: "", priority: "medium", category: "", tags: "" };

const inputCls =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400";

const tagsOf = (t) => (Array.isArray(t.tags) ? t.tags : []);
const parseTags = (s) => [
  ...new Set(
    s
      .split(",")
      .map((x) => x.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean)
  ),
];
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
// Tasks with a date but no time count as due at the end of that day
const dueStamp = (t) => (t.dueDate ? new Date(`${t.dueDate}T${t.dueTime || "23:59"}`).getTime() : Infinity);
const isOverdue = (t) => !t.completed && dueStamp(t) < Date.now();

function formatDue(t) {
  if (!t.dueDate) return "";
  const date = new Date(`${t.dueDate}T00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!t.dueTime) return date;
  const time = new Date(`${t.dueDate}T${t.dueTime}`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

function matchesDate(t, filter) {
  const today = startOfToday();
  const stamp = dueStamp(t);
  switch (filter) {
    case "overdue":
      return isOverdue(t);
    case "today":
      return !!t.dueDate && stamp >= today && stamp < today + DAY;
    case "week":
      return !!t.dueDate && stamp >= today && stamp < today + 7 * DAY;
    case "none":
      return !t.dueDate;
    default:
      return true;
  }
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {children}
      </select>
    </label>
  );
}

function TaskForm({ initial = EMPTY_FORM, submitLabel, onSubmit, onCancel, categories, resetOnSave, startOpen }) {
  const [values, setValues] = useState(initial);
  const [open, setOpen] = useState(!!startOpen);
  const listId = useId();
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const title = values.title.trim();
    if (!title) return;
    const ok = await onSubmit({
      title,
      dueDate: values.dueDate,
      dueTime: values.dueDate ? values.dueTime : "",
      priority: values.priority,
      category: values.category.trim(),
      tags: parseTags(values.tags),
    });
    if (ok && resetOnSave) setValues(EMPTY_FORM);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          value={values.title}
          onChange={set("title")}
          placeholder="What needs doing?"
          required
          aria-label="Task title"
          className={`min-w-0 flex-1 ${inputCls}`}
        />
        <button className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-sm text-teal-700 hover:underline dark:text-teal-400"
      >
        {open ? "Hide details" : "Add details"}
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            Due date
            <input type="date" value={values.dueDate} onChange={set("dueDate")} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            Due time
            <input
              type="time"
              value={values.dueTime}
              onChange={set("dueTime")}
              disabled={!values.dueDate}
              className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500`}
            />
          </label>
          <Select
            label="Priority"
            value={values.priority}
            onChange={(v) => setValues((s) => ({ ...s, priority: v }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </Select>
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            List or project
            <input
              value={values.category}
              onChange={set("category")}
              list={listId}
              placeholder="e.g. Work"
              className={inputCls}
            />
            <datalist id={listId}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            Tags (separate with commas)
            <input value={values.tags} onChange={set("tags")} placeholder="e.g. errands, urgent" className={inputCls} />
          </label>
        </div>
      )}
    </form>
  );
}

export default function Home({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // filters + sorting
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("any");
  const [sort, setSort] = useState("created");

  const [order, setOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const fail = (err) => {
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

  const addTodo = async (payload) => {
    setError("");
    try {
      const created = await request(ROUTES.todos, { method: "POST", body: payload });
      setTodos((prev) => [{ ...(created.todo || created), ...payload }, ...prev]);
      return true;
    } catch (err) {
      fail(err);
      return false;
    }
  };

  const updateTodo = async (id, patch) => {
    setError("");
    try {
      const updated = await request(ROUTES.todo(id), { method: "PUT", body: patch });
      const next = updated.todo || updated;
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...next, ...patch } : t)));
      return true;
    } catch (err) {
      fail(err);
      return false;
    }
  };

  const toggleTodo = (todo) => updateTodo(todo.id, { completed: !todo.completed });

  const saveEdit = (todo) => async (payload) => {
    const ok = await updateTodo(todo.id, payload);
    if (ok) setEditingId(null);
    return ok;
  };

  const deleteTodo = async (id) => {
    setError("");
    try {
      await request(ROUTES.todo(id), { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      fail(err);
    }
  };

  const rank = (id) => order.indexOf(id); // ids not yet in the list (new tasks) come first

  const saveOrder = (ids) => {
    setOrder(ids);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable; order just won't persist
    }
  };

  const moveTodo = (fromId, toId) => {
    if (fromId === toId) return;
    const ids = [...todos].sort((a, b) => rank(a.id) - rank(b.id)).map((t) => t.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    saveOrder(ids);
  };

  const categories = [...new Set(todos.map((t) => (t.category || "").trim()).filter(Boolean))].sort();
  const allTags = [...new Set(todos.flatMap(tagsOf))].sort();
  const remaining = todos.filter((t) => !t.completed).length;

  const q = query.trim().toLowerCase();
  const filtered = todos.filter((t) => {
    if (status === "done" && !t.completed) return false;
    if (status === "active" && t.completed) return false;
    if (priorityFilter !== "all" && (t.priority || "medium") !== priorityFilter) return false;
    if (categoryFilter !== "all" && (t.category || "") !== categoryFilter) return false;
    if (tagFilter !== "all" && !tagsOf(t).includes(tagFilter)) return false;
    if (!matchesDate(t, dateFilter)) return false;
    if (q) {
      const haystack = [t.title, t.category, ...tagsOf(t)].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const position = new Map(todos.map((t, i) => [t.id, i]));
  const createdAt = (t) => (t.createdAt ? new Date(t.createdAt).getTime() : -position.get(t.id));
  const comparators = {
    created: (a, b) => createdAt(b) - createdAt(a),
    due: (a, b) => {
      const diff = dueStamp(a) - dueStamp(b);
      return Number.isNaN(diff) || diff === 0 ? 0 : diff < 0 ? -1 : 1; // Infinity - Infinity is NaN
    },
    priority: (a, b) =>
      PRIORITY_WEIGHT[a.priority || "medium"] - PRIORITY_WEIGHT[b.priority || "medium"],
    manual: (a, b) => rank(a.id) - rank(b.id),
  };
  const visible = [...filtered].sort(
    (a, b) => comparators[sort](a, b) || position.get(a.id) - position.get(b.id)
  );

  const filtersActive =
    status !== "all" ||
    q !== "" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    tagFilter !== "all" ||
    dateFilter !== "any";

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setTagFilter("all");
    setDateFilter("any");
  };

  const manual = sort === "manual";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex items-center justify-center p-4 pt-10">
        <div className="w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Today's tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {remaining === 0 ? "Nothing left to do" : `${remaining} left to finish`}
            </p>
          </header>

          <TaskForm submitLabel="Add task" onSubmit={addTodo} categories={categories} resetOnSave />

          <section
            className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700"
            aria-label="Search and filters"
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, lists and tags"
              aria-label="Search tasks"
              className={`w-full ${inputCls}`}
            />

            <div className="flex gap-2">
              {STATUSES.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatus(f)}
                  className={`rounded-full px-3 py-1 text-sm capitalize ${
                    status === f
                      ? "bg-gray-900 text-white dark:bg-teal-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Select label="Priority" value={priorityFilter} onChange={setPriorityFilter}>
                <option value="all">All priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </Select>
              <Select label="List or project" value={categoryFilter} onChange={setCategoryFilter}>
                <option value="all">All lists</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select label="Tag" value={tagFilter} onChange={setTagFilter}>
                <option value="all">All tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </Select>
              <Select label="Due" value={dateFilter} onChange={setDateFilter}>
                {DATE_FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select label="Sort by" value={sort} onChange={setSort}>
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="self-end rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Clear filters
                </button>
              )}
            </div>

            {manual && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag tasks by the handle, or use the arrows, to reorder.
              </p>
            )}
          </section>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
            {loading && <li className="text-sm text-gray-500 dark:text-gray-400">Loading your tasks...</li>}

            {!loading && visible.length === 0 && (
              <li className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                {todos.length === 0
                  ? "No tasks yet. Add your first one above."
                  : "No tasks match these filters."}
              </li>
            )}

            {visible.map((todo, i) => {
              const priority = todo.priority || "medium";
              const style = PRIORITY_STYLE[priority] || PRIORITY_STYLE.medium;
              const overdue = isOverdue(todo);

              if (editingId === todo.id) {
                return (
                  <li
                    key={todo.id}
                    className="rounded-lg border border-teal-600 bg-white px-3 py-3 dark:bg-gray-800"
                  >
                    <TaskForm
                      initial={{
                        title: todo.title || "",
                        dueDate: todo.dueDate || "",
                        dueTime: todo.dueTime || "",
                        priority,
                        category: todo.category || "",
                        tags: tagsOf(todo).join(", "),
                      }}
                      submitLabel="Save"
                      onSubmit={saveEdit(todo)}
                      onCancel={() => setEditingId(null)}
                      categories={categories}
                      startOpen
                    />
                  </li>
                );
              }

              return (
                <li
                  key={todo.id}
                  draggable={manual}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(todo.id));
                    setDragId(todo.id);
                  }}
                  onDragOver={(e) => {
                    if (!manual || dragId === null) return;
                    e.preventDefault();
                    setOverId(todo.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId !== null) moveTodo(dragId, todo.id);
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className={`flex items-start gap-3 rounded-lg border border-l-4 border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 ${
                    style.bar
                  } ${dragId === todo.id ? "opacity-40" : ""} ${
                    overId === todo.id && dragId !== todo.id ? "ring-2 ring-teal-600" : ""
                  }`}
                >
                  {manual && (
                    <span
                      className="mt-0.5 cursor-grab select-none text-gray-400"
                      aria-hidden="true"
                      title="Drag to reorder"
                    >
                      ⠿
                    </span>
                  )}

                  <input
                    type="checkbox"
                    checked={!!todo.completed}
                    onChange={() => toggleTodo(todo)}
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
                    className="mt-1 h-4 w-4 accent-teal-700"
                  />

                  <div className="min-w-0 flex-1">
                    <span
                      className={`block break-words ${
                        todo.completed
                          ? "text-gray-400 line-through dark:text-gray-500"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {todo.title}
                    </span>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${style.badge}`}>{priority}</span>
                      {todo.dueDate && (
                        <span
                          className={`rounded-full px-2 py-0.5 ${
                            overdue
                              ? "bg-red-100 font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {overdue ? "Overdue: " : "Due "}
                          {formatDue(todo)}
                        </span>
                      )}
                      {todo.category && (
                        <button
                          onClick={() => setCategoryFilter(todo.category)}
                          className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800 hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                          title="Show only this list"
                        >
                          {todo.category}
                        </button>
                      )}
                      {tagsOf(todo).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setTagFilter(tag)}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          title="Show only this tag"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {manual && (
                      <>
                        <button
                          onClick={() => moveTodo(todo.id, visible[i - 1].id)}
                          disabled={i === 0}
                          aria-label={`Move "${todo.title}" up`}
                          className="text-gray-400 hover:text-gray-900 disabled:opacity-30 dark:hover:text-white"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveTodo(todo.id, visible[i + 1].id)}
                          disabled={i === visible.length - 1}
                          aria-label={`Move "${todo.title}" down`}
                          className="text-gray-400 hover:text-gray-900 disabled:opacity-30 dark:hover:text-white"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setEditingId(todo.id)}
                      aria-label={`Edit "${todo.title}"`}
                      className="text-gray-400 hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`Delete "${todo.title}"`}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      <About />
    </div>
  );
}