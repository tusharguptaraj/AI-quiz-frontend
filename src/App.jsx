import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Quizzes from "./pages/Quizzes";
import Analytics from "./pages/Analytics";
import CreateQuiz from "./pages/CreateQuiz";


// 🔒 Wrapper component for protecting routes
function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p className="text-center text-white">Loading...</p>;

  // If no user, redirect to login page
  if (!user) return <Navigate to="/login" replace />;

  // Otherwise, render the protected page
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <Quizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/createquiz"
        element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
