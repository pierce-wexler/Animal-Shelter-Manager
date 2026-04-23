// File created/updated with help from chatgpt
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";

import UserManager from "./UserManager";
import RecordManager from "./RecordManager";
import PetManager from "./PetManager";
import EventManager from "./EventManager";
import AdoptionRequestManager from "./AdoptionRequestManager";
import PetCards from "./PetCards";
import MyRequests from "./MyRequests"; // ✅ added

export default function Dashboard() {
  const navigate = useNavigate();

  // =======================
  // Decode JWT
  // =======================
  const token = localStorage.getItem("token");

  const userData = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const role = userData?.role || localStorage.getItem("role");
  const isAdmin = userData?.isAdmin || false;
  const fname = userData?.fname || "";
  const lname = userData?.lname || "";
  const fullName = `${fname} ${lname}`.trim();
  // =======================
  // Default tabs by role
  // =======================
  const defaultTab =
    role === "adopter"
      ? "gallery"
      : role === "volunteer"
        ? "events"
        : isAdmin
          ? "users"
          : "pets";

  const [activeTab, setActiveTab] = useState(defaultTab);

  // =======================
  // Logout
  // =======================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            {fullName
              ? `${fullName}'s ${isAdmin
                ? "Superuser Dashboard"
                : role === "staff"
                  ? "Staff Dashboard"
                  : role === "volunteer"
                    ? "Volunteer Dashboard"
                    : "Adopter Dashboard"
              }`
              : isAdmin
                ? "Superuser Dashboard"
                : role === "staff"
                  ? "Staff Dashboard"
                  : role === "volunteer"
                    ? "Volunteer Dashboard"
                    : "Adopter Dashboard"}
          </h1>

          <p style={{ margin: 0, color: "#718096" }}>
            Animal Shelter Management System
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>

          {/* PROFILE BUTTON */}
          <button
            onClick={goToProfile}
            style={{
              padding: "10px 18px",
              borderRadius: "20px",
              border: "2px solid #3b82f6",
              backgroundColor: "white",
              color: "#3b82f6",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            Profile
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>

        </div>
      </div>

      {/* NAV */}
      <div style={tabStyles.nav}>
        {/* ADMIN ONLY */}
        {isAdmin && (
          <button
            style={
              activeTab === "users"
                ? tabStyles.activeBtn
                : tabStyles.btn
            }
            onClick={() => setActiveTab("users")}
          >
            Admin
          </button>
        )}

        {/* STAFF + ADMIN */}
        {(role === "staff" || isAdmin) && (
          <>

            <button
              style={
                activeTab === "pets"
                  ? tabStyles.activeBtn
                  : tabStyles.btn
              }
              onClick={() => setActiveTab("pets")}
            >
              Pets
            </button>
            <button
              style={
                activeTab === "requests"
                  ? tabStyles.activeBtn
                  : tabStyles.btn
              }
              onClick={() => setActiveTab("requests")}
            >
              Requests
            </button>
            <button
              style={
                activeTab === "records"
                  ? tabStyles.activeBtn
                  : tabStyles.btn
              }
              onClick={() => setActiveTab("records")}
            >
              Records
            </button>
          </>
        )}

        {/* STAFF + VOLUNTEERS */}
        {(role === "staff" ||
          role === "volunteer" ||
          isAdmin) && (
            <button
              style={
                activeTab === "events"
                  ? tabStyles.activeBtn
                  : tabStyles.btn
              }
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
          )}

        {/* ALL USERS */}
        {(role === "adopter" ||
          role === "staff" ||
          role === "volunteer" ||
          isAdmin) && (
            <>
              <button
                style={
                  activeTab === "gallery"
                    ? tabStyles.activeBtn
                    : tabStyles.btn
                }
                onClick={() => setActiveTab("gallery")}
              >
                Pet Gallery
              </button>
            </>
          )}

        {/* ADOPTER ONLY */}
        {role === "adopter" && (
          <button
            style={
              activeTab === "myRequests"
                ? tabStyles.activeBtn
                : tabStyles.btn
            }
            onClick={() => setActiveTab("myRequests")}
          >
            My Requests
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "users" && isAdmin && (
          <UserManager />
        )}

        {activeTab === "pets" &&
          (role === "staff" || isAdmin) && (
            <PetManager />
          )}

        {activeTab === "records" &&
          (role === "staff" || isAdmin) && (
            <RecordManager />
          )}

        {activeTab === "events" &&
          (role === "staff" || role === "volunteer" || isAdmin) && (
            <EventManager />
          )}

        {/* STAFF / ADMIN REQUESTS */}
        {activeTab === "requests" &&
          (role === "staff" || isAdmin) && (
            <AdoptionRequestManager />
          )}

        {/* ADOPTER REQUESTS */}
        {activeTab === "myRequests" && role === "adopter" && (
          <MyRequests />
        )}

        {activeTab === "gallery" && (
          <PetCards />
        )}
      </div>
    </div>
  );
}

const tabStyles = {
  nav: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    width: "fit-content",
    margin: "0 auto",
    borderRadius: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  btn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "transparent",
    color: "#718096",
    cursor: "pointer",
    fontWeight: "600",
  },

  activeBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
};