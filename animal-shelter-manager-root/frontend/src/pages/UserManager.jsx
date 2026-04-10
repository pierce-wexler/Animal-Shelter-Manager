import { useState } from "react";
import "./Manager.css"; // We will create this file below

export default function UserManager() {
  const [form, setForm] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    passwordHash: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAction = async (method, url) => {
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") options.body = JSON.stringify(form);

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Success!");
    } catch (err) {
      setIsError(true);
      setMessage("Network or server error");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">User Manager</h2>

      <div className="form-container">
        <label className="input-label">User Identification</label>
        <input
          name="userId"
          placeholder="User ID (Required for Update/Delete)"
          value={form.userId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Personal Information</label>
        <div className="input-row">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="custom-input"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <input
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="custom-input"
        />

        <input
          name="passwordHash"
          type="password"
          placeholder="Password"
          value={form.passwordHash}
          onChange={handleChange}
          className="custom-input"
        />
      </div>

      <div className="button-group">
        <button onClick={() => handleAction("POST", "/api/users")} className="btn btn-create">Create</button>
        <button onClick={() => handleAction("PUT", `/api/users/${form.userId}`)} className="btn btn-update">Update</button>
        <button onClick={() => handleAction("DELETE", `/api/users/${form.userId}`)} className="btn btn-delete">Delete</button>
      </div>

      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}