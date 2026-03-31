// Created file from chatgpt
import { Routes, Route, Link } from "react-router-dom";
import UserManager from "./pages/UserManager";
import UserTypeManager from "./pages/UserTypeManager";
import PetManager from "./pages/PetManager";
import EventManager from "./pages/EventManager";
import AdoptionRequestManager from "./pages/AdoptionRequestManager";

export default function App() {
  return (
    <div>
      {/* SIMPLE NAVBAR */}
      <nav style={{ marginBottom: "10px" }}>
        <a href="/" style={{ marginRight: "10px" }}>Users</a>
        <a href="/types" style={{ marginRight: "10px" }}>User Types</a>
        <a href="/pets" style={{ marginRight: "10px" }}>Pets</a>
        <a href="/events" style={{ marginRight: "10px" }}>Events</a>
        <a href="/requests" style={{ marginRight: "10px" }}>Adoption Request</a>
      </nav>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<UserManager />} />
        <Route path="/types" element={<UserTypeManager />} />
        <Route path="/pets" element={<PetManager />} />
        <Route path="/events" element={<EventManager />} />
        <Route path="/requests" element={<AdoptionRequestManager />} />
      </Routes>
    </div>
  );
}