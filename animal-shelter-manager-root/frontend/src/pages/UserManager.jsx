
import { useState, useEffect } from "react";
import "./Manager.css";

export default function UserManager() {
  const token = localStorage.getItem("token");

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

  // =====================================
  // FETCH USERS BASED ON ROLE TYPE
  // =====================================
  const fetchUsers = async (role = form.roleType) => {
    try {
      let endpoint = "/api/admin/users";

      if (role === "adopter") {
        endpoint = "/api/admin/users/adopters";
      } else if (
        role === "staff" ||
        role === "admin"
      ) {
        endpoint = "/api/admin/users/staff";
      } else if (role === "volunteer") {
        endpoint = "/api/admin/users/volunteers";
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = await res.json();

      // Filter staff/admin from same endpoint
      if (role === "admin") {
        data = data.filter(
          (u) => u.roleType === "admin"
        );
      }

      if (role === "staff") {
        data = data.filter(
          (u) => u.roleType === "staff"
        );
      }

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
  // INPUT CHANGE
  // =====================================
  const handleChange = (e) => {
    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(updated);

    if (e.target.name === "roleType") {
      fetchUsers(e.target.value);
    }
  };

  // =====================================
  // CRUD ACTIONS
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
      setMessage(data.message || data.error);

      if (res.ok) {
        fetchUsers();
      }

    } catch {
      setIsError(true);
      setMessage("Server error");
    }
  };

  // =====================================
  // ROW CLICK → AUTOFILL FORM
  // =====================================
  const handleRowClick = (user) => {
    setForm({
      userId: user.userId || "",
      fname: user.fname || "",
      lname: user.lname || "",
      email: user.email || "",
      password: "", // never autofill password

      roleType: user.roleType || form.roleType,

      qualificationNotes: user.qualificationNotes || "",
      blacklistFlag:
        user.blacklistFlag !== undefined
          ? String(user.blacklistFlag)
          : "0",

      supervisor: user.supervisor || "",
    });
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">
        User + Role Management
      </h2>

      {/* FORM */}
      <div className="form-container">

        <label className="input-label">
          Existing User ID (Required for Update/Delete)
        </label>

        <input
          name="userId"
          placeholder="Auto-filled when clicking a row"
          value={form.userId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">
          Basic Info
        </label>

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

        {/* ACCOUNT TYPE */}
        <label className="input-label">
          Account Type
        </label>

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

        {/* ROLE FIELDS */}
        <label className="input-label">
          Role Details
        </label>

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
              <option value="0">
                Not Blacklisted
              </option>
              <option value="1">
                Blacklisted
              </option>
            </select>
          </>
        ) : (
          <input
            name="supervisor"
            placeholder="Supervisor User ID"
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

      {/* MESSAGE */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* TABLE */}
      <div style={{ marginTop: "30px" }}>
        <h3>
          Current {form.roleType} Accounts
        </h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>

              {form.roleType === "adopter" && (
                <>
                  <th>Notes</th>
                  <th>Blacklisted</th>
                </>
              )}

              {(form.roleType === "staff" ||
                form.roleType === "admin" ||
                form.roleType === "volunteer") && (
                <th>Supervisor</th>
              )}

              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.userId}
                onClick={() => handleRowClick(user)}
                style={{ cursor: "pointer" }}
              >
                <td>{user.userId}</td>
                <td>{user.fname}</td>
                <td>{user.lname}</td>
                <td>{user.email}</td>

                {form.roleType === "adopter" && (
                  <>
                    <td>
                      {user.qualificationNotes}
                    </td>
                    <td>
                      {user.blacklistFlag
                        ? "Yes"
                        : "No"}
                    </td>
                  </>
                )}

                {(form.roleType === "staff" ||
                  form.roleType === "admin" ||
                  form.roleType === "volunteer") && (
                  <td>
                    {user.supervisor || "-"}
                  </td>
                )}

                <td>
                  {user.roleType ||
                    form.roleType}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}