
import { useState, useEffect } from "react";
import "./Manager.css";

export default function UserManager() {
  const [form, setForm] = useState({
    userId: "",
    fname: "",
    lname: "",
    email: "",
    password: "",
    roleType: "adopter",
    qualificationNotes: "",
    blacklistFlag: "0",
    supervisor: "",
  });

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem("token");

  // =====================================
  // Load Users
  // =====================================
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================
  // Form Changes
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // CRUD Actions
  // =====================================
  const handleAction = async (method) => {
    try {
      const url =
        method === "POST"
          ? "/api/admin/users"
          : `/api/admin/users/${form.userId}`;

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (method !== "DELETE") {
        options.body = JSON.stringify(form);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Success");

      if (res.ok) {
        fetchUsers();
      }

    } catch {
      setIsError(true);
      setMessage("Network or server error");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">User + Role Management</h2>

      {/* FORM */}
      <div className="form-container">

        <label className="input-label">
          Existing User ID (Update / Delete Only)
        </label>

        <input
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Basic Information</label>

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

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Account Type</label>

        <select
          name="roleType"
          value={form.roleType}
          onChange={handleChange}
          className="custom-input"
        >
          <option value="adopter">Adopter</option>
          <option value="staff">Staff</option>
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>

        <label className="input-label">Role Details</label>

        {form.roleType === "adopter" ? (
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
          <input
            name="supervisor"
            placeholder="Supervisor User ID (optional)"
            value={form.supervisor}
            onChange={handleChange}
            className="custom-input"
          />
        )}
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          onClick={() => handleAction("POST")}
          className="btn btn-create"
        >
          Create
        </button>

        <button
          onClick={() => handleAction("PUT")}
          className="btn btn-update"
        >
          Update
        </button>

        <button
          onClick={() => handleAction("DELETE")}
          className="btn btn-delete"
        >
          Delete
        </button>
      </div>

      {/* STATUS */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* TABLE VIEW */}
      <div style={{ marginTop: "30px" }}>
        <h3>Current Users</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.fname}</td>
                <td>{user.lname}</td>
                <td>{user.email}</td>
                <td>{user.roleType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
