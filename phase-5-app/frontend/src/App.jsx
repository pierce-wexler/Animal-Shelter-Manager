// Created file from chatgpt
import { Routes, Route, Link } from "react-router-dom";
import UserManager from "./pages/UserManager";
import UserTypeManager from "./pages/UserTypeManager";

export default function App() {
  return (
    <div>
      {/* SIMPLE NAVBAR */}
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Users</Link> |{" "}
        <Link to="/types">User Types</Link>
      </nav>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<UserManager />} />
        <Route path="/types" element={<UserTypeManager />} />
      </Routes>
    </div>
  );
}