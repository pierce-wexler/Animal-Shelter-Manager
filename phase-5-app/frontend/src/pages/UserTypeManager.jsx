import { useState } from "react";
import "./Manager.css";

export default function UserTypeManager() {
  const [type, setType] = useState("adopter");
  const [form, setForm] = useState({
    userId: "",
    qualificationNotes: "",
    blacklistFlag: "",
    supervisor: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const endpointMap = {
    adopter: "/api/adopters",
    staff: "/api/staff",
    volunteer: "/api/volunteers",
  };

  const handleAction = async (method) => {
    const url = `${endpointMap[type]}${method !== "POST" ? `/${form.userId}` : ""}`;
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") options.body = JSON.stringify(form);

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Action Successful");
    } catch {
      setIsError(true);
      setMessage("Network error");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">Role Management</h2>

      <div className="form-container">
        <label className="input-label">Select User Type</label>
        <select className="custom-input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="adopter">Adopter</option>
          <option value="staff">Staff</option>
          <option value="volunteer">Volunteer</option>
        </select>

        <label className="input-label">User ID Reference</label>
        <input
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Role Specific Details</label>
        {type === "adopter" ? (
          <>
            <input
              name="qualificationNotes"
              placeholder="Qualification Notes"
              value={form.qualificationNotes}
              onChange={handleChange}
              className="custom-input"
            />
            <input
              name="blacklistFlag"
              placeholder="Blacklist Flag (0 or 1)"
              value={form.blacklistFlag}
              onChange={handleChange}
              className="custom-input"
            />
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

      <div className="button-group">
        <button onClick={() => handleAction("POST")} className="btn btn-create">Create</button>
        <button onClick={() => handleAction("PUT")} className="btn btn-update">Update</button>
        <button onClick={() => handleAction("DELETE")} className="btn btn-delete">Delete</button>
      </div>

      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}