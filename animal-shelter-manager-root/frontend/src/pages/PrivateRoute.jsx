// File created/updated with help from chatgpt
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PrivateRoute({
  children,
  requiredRole = null,
  adminOnly = false,
}) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // =====================================
  // NO TOKEN
  // =====================================
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  try {
    const decoded = jwtDecode(token);

    // =====================================
    // TOKEN EXPIRED
    // =====================================
    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("isAdmin");

      return (
        <Navigate
          to="/login"
          replace
          state={{ expired: true }}
        />
      );
    }

    const role =
      decoded.role || localStorage.getItem("role");

    const isAdmin =
      decoded.isAdmin ||
      localStorage.getItem("isAdmin") === "true";

    // =====================================
    // ADMIN ONLY
    // =====================================
    if (adminOnly && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    // =====================================
    // ROLE REQUIRED
    // =====================================
    if (requiredRole && role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }

    // =====================================
    // VALID ACCESS
    // =====================================
    return children;

  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");

    return <Navigate to="/login" replace />;
  }
}
