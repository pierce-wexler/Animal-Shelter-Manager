import { useState } from "react"; 
import UserManager from "./pages/UserManager";
import UserTypeManager from "./pages/UserTypeManager";
import RecordManager from "./pages/RecordManager";
import PetManager from "./pages/PetManager"; // Your partner's new page
import "./index.css"; 

export default function App() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "20px" }}>
      
      {/* HEADER AREA */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1a202c', margin: '0' }}>Admin Dashboard</h1>
        <p style={{ color: '#718096' }}>Manage users, pets, and shelter operations.</p>
      </div>

      {/* TAB NAVIGATION */}
      <div style={tabStyles.nav}>
        <button 
          style={activeTab === "users" ? tabStyles.activeBtn : tabStyles.btn}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button 
          style={activeTab === "roles" ? tabStyles.activeBtn : tabStyles.btn}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button 
          style={activeTab === "pets" ? tabStyles.activeBtn : tabStyles.btn}
          onClick={() => setActiveTab("pets")}
        >
          Pets
        </button>
        <button 
          style={activeTab === "records" ? tabStyles.activeBtn : tabStyles.btn}
          onClick={() => setActiveTab("records")}
        >
          Pet Records
        </button>
      </div>

      {/* CONTENT AREA */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "users" && <UserManager />}
        {activeTab === "roles" && <UserTypeManager />}
        {activeTab === "pets" && <PetManager />}
        {activeTab === "records" && <RecordManager />}
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
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  activeBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
  }
};