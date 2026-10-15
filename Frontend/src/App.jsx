// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./components/About";
import { request, ROUTES } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask the backend who we are (the browser sends the cookie automatically)
  const fetchUser = async () => {
    try {
      const data = await request(ROUTES.me);
       setUser(data.user ?? null);
    } catch {
      setUser(null); // 401 just means "not logged in"
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await request(ROUTES.logout, { method: "POST" });
    } catch {
      // even if the request fails, drop the local session state
    }
    setUser(null);
  };

  // Prevents a logged-in user from being bounced to /login on page refresh
  if (loading) {
    return <div className="min-h-screen bg-gray-800 p-10 text-white">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Home user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onAuth={fetchUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register onAuth={fetchUser} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;