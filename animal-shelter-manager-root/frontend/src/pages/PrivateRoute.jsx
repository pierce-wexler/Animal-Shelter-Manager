// File created/updated with help from chatgpt
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PrivateRoute({
  children,
  requiredRole = null,
  adminOnly = false,
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Expired token
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("isAdmin");

      return <Navigate to="/login" replace />;
    }

    // Role restriction
    if (requiredRole && decoded.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }

    // Admin restriction
    if (adminOnly && !decoded.isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;

  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");

    return <Navigate to="/login" replace />;
  }
}