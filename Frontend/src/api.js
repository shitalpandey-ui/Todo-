

export const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const ROUTES = {
  login: "/api/auth/login", // POST { email, password } -> sets httpOnly cookie
  register: "/api/auth/register", // POST { name, email, password } -> sets cookie
  me: "/api/auth/me", // GET -> current user (needs valid cookie)
  logout: "/api/auth/logout", // POST -> clears cookie
  todos: "/api/tasks", // GET, POST { title }
  todo: (id) => `/api/tasks/${id}`, // PUT { completed } / DELETE
};

export async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined, 
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}