import { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode"; 
import "./Manager.css";

export default function UserManager() {
  const token = localStorage.getItem("token");

  // ADDED: role detection
  const tokenData = token ? jwtDecode(token) : {};
  const role = tokenData?.role?.toLowerCase();
  const isAdmin = tokenData?.isAdmin;

  const emptyForm = {
    userId: "",
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleType: "adopter",
    qualificationNotes: "",
    blacklistFlag: "0",
    supervisor: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // MODIFIED: lock staff to adopters
  const [viewRole, setViewRole] = useState("adopter");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        (u.roleType || "").toLowerCase().trim() ===
        viewRole.toLowerCase().trim()
    );
  }, [users, viewRole]);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach(u => {
      map[u.userId] = `${u.fname} ${u.lname}`;
    });
    return map;
  }, [users]);

  const resetForm = () => {
    setSelectedUserId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRowClick = (user) => {
    setSelectedUserId(user.userId);

    setForm({
      userId: user.userId,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      password: "",
      confirmPassword: "",
      roleType: user.roleType,
      qualificationNotes: user.qualificationNotes || "",
      blacklistFlag: String(user.blacklistFlag ?? "0"),
      supervisor: user.supervisor || "",
    });
  };

  const handleAction = async (method) => {
    try {
      // ADDED: enforce restriction
      if (!isAdmin && role === "staff" && viewRole !== "adopter") {
        setIsError(true);
        setMessage("Staff can only manage adopters");
        return;
      }

      if (method === "DELETE") {
        if (!window.confirm("Delete this user?")) return;
      }

      if (method === "PUT") {
        if (!window.confirm("Update this user?")) return;
      }

      if (method === "POST") {
        if (form.password !== form.confirmPassword) {
          setIsError(true);
          setMessage("Passwords do not match");
          return;
        }
      }

      const url =
        method === "POST"
          ? "/api/admin/users"
          : `/api/admin/users/${form.userId}`;

      const payload = { ...form, roleType: viewRole };

      payload.roleType = viewRole;

      delete payload.confirmPassword;

      if (method === "PUT") {
        delete payload.password;
      }

      if (payload.roleType !== "adopter") {
        delete payload.qualificationNotes;
        delete payload.blacklistFlag;
      } else {
        delete payload.supervisor;
      }

      payload.blacklistFlag = Number(payload.blacklistFlag);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(method !== "DELETE" && {
          body: JSON.stringify(payload),
        }),
      });

      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (!res.ok) return;

      fetchUsers();

      if (method === "POST" || method === "DELETE") {
        resetForm();
      }
    } catch {
      setIsError(true);
      setMessage("Server error");
    }
  };

  // ✅ ADDED: UI restriction flag
  const isRestricted = !isAdmin && role === "staff" && viewRole !== "adopter";

  return (
    <div className="manager-card">
      <h2 className="manager-title">User + Role Management</h2>

      {/* VIEW ROLE */}
      <label className="input-label">View Role</label>
      <select
        value={viewRole}
        onChange={(e) => {
          // block staff switching
          if (!isAdmin && role === "staff") return;

          const newRole = e.target.value;
          setViewRole(newRole);
          setSelectedUserId(null);

          setForm(prev => ({
            ...prev,
            roleType: newRole
          }));
        }}
        className="custom-input"
      >
        <option value="adopter">Adopters</option>

        {/* ✅ ADDED: only admin can see others */}
        {isAdmin && (
          <>
            <option value="staff">Staff</option>
            <option value="volunteer">Volunteers</option>
            <option value="admin">Admins</option>
          </>
        )}
      </select>

      {/* EDIT MODE */}
      {selectedUserId && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontWeight: 600, color: "#2563eb" }}>
            Editing User ID: {selectedUserId}
          </span>

          <button
            className="btn-thin"
            style={{ background: "#6b7280" }}
            onClick={resetForm}
          >
            Stop Editing
          </button>
        </div>
      )}

      {/* FORM */}
      <div className="form-container">
        <label className="input-label">Basic Info</label>

        <div className="input-row">
          <input
            name="fname"
            placeholder="First Name"
            value={form.fname}
            onChange={handleChange}
            className="custom-input"
          />

          <input
            name="lname"
            placeholder="Last Name"
            value={form.lname}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="custom-input"
        />

        {!selectedUserId && (
          <>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="custom-input"
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="custom-input"
            />
          </>
        )}

        <label className="input-label">Role Details</label>

        {viewRole === "adopter" ? (
          <>
            <input
              name="qualificationNotes"
              placeholder="Qualification Notes"
              value={form.qualificationNotes}
              onChange={handleChange}
              className="custom-input"
            />

            <select
              name="blacklistFlag"
              value={form.blacklistFlag}
              onChange={handleChange}
              className="custom-input"
            >
              <option value="0">Not Blacklisted</option>
              <option value="1">Blacklisted</option>
            </select>
          </>
        ) : (
          <select
            name="supervisor"
            value={form.supervisor}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Supervisor</option>

            {users
              .filter(u =>
                ["staff", "admin"].includes(
                  (u.roleType || "").toLowerCase()
                )
              )
              .map((u) => (
                <option key={u.userId} value={u.userId}>
                  #{u.userId} – {u.fname} {u.lname}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          onClick={() => handleAction("POST")}
          className="btn btn-create"
          disabled={!!selectedUserId || isRestricted}
        >
          Create
        </button>

        <button
          onClick={() => handleAction("PUT")}
          className="btn btn-update"
          disabled={!selectedUserId || isRestricted}
        >
          Update
        </button>

        <button
          onClick={() => handleAction("DELETE")}
          className="btn btn-delete"
          disabled={!selectedUserId || isRestricted}
        >
          Delete
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* TABLE */}
      <div style={{ marginTop: "30px" }}>
        <h3>Click row to edit</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First</th>
                <th>Last</th>
                <th>Email</th>

                {viewRole === "adopter" && (
                  <>
                    <th>Notes</th>
                    <th>Blacklisted</th>
                  </>
                )}

                {["staff", "admin", "volunteer"].includes(viewRole) && (
                  <th>Supervisor</th>
                )}

                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.userId}
                  onClick={() => handleRowClick(user)}
                  className={
                    selectedUserId == user.userId
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{user.userId}</td>
                  <td>{user.fname}</td>
                  <td>{user.lname}</td>
                  <td>{user.email}</td>

                  {viewRole === "adopter" && (
                    <>
                      <td>{user.qualificationNotes}</td>
                      <td>{user.blacklistFlag ? "Yes" : "No"}</td>
                    </>
                  )}

                  {["staff", "admin", "volunteer"].includes(viewRole) && (
                    <td>
                      {user.supervisor
                        ? `#${user.supervisor} – ${userMap[user.supervisor] || "Unknown"}`
                        : "-"}
                    </td>
                  )}

                  <td>{user.roleType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}