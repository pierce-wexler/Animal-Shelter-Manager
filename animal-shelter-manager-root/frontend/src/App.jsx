// File created/updated with help from chatgpt
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AdoptionForm from "./pages/AdoptionForm";
import PrivateRoute from "./pages/PrivateRoute";
import ProfileSettings from "./pages/ProfileSettings";

export default function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public Login / Signup */}
      <Route
        path="/login"
        element={<AuthPage />}
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Adoption Page */}
      <Route
        path="/adopt/:petId"
        element={
          <PrivateRoute>
            <AdoptionForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfileSettings />
          </PrivateRoute>
        }
      />

      {/* Catch All */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}
