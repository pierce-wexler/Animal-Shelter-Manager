// File created/updated with help from chatgpt
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import UserManager from "./UserManager";
import UserTypeManager from "./UserTypeManager";
import RecordManager from "./RecordManager";
import PetManager from "./PetManager";
import EventManager from "./EventManager";
import AdoptionRequestManager from "./AdoptionRequestManager";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "20px" }}>
      
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#718096" }}>
            Shelter Management System
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Logout
        </button>
      </div>

      {/* NAV */}
      <div style={tabStyles.nav}>
        <button style={activeTab === "users" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("users")}>Users</button>
        <button style={activeTab === "roles" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("roles")}>Roles</button>
        <button style={activeTab === "pets" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("pets")}>Pets</button>
        <button style={activeTab === "records" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("records")}>Records</button>
        <button style={activeTab === "events" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("events")}>Events</button>
        <button style={activeTab === "requests" ? tabStyles.activeBtn : tabStyles.btn} onClick={() => setActiveTab("requests")}>Requests</button>
      </div>

      {/* CONTENT */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "users" && <UserManager />}
        {activeTab === "roles" && <UserTypeManager />}
        {activeTab === "pets" && <PetManager />}
        {activeTab === "records" && <RecordManager />}
        {activeTab === "events" && <EventManager />}
        {activeTab === "requests" && <AdoptionRequestManager />}
      </div>
    </div>
  );
}

const tabStyles = {
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    width: "fit-content",
    margin: "0 auto",
    borderRadius: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  btn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "transparent",
    color: "#718096",
    cursor: "pointer",
    fontWeight: "600"
  },
  activeBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }
};
