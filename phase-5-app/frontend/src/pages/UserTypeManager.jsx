// File generated from chatgpt
import { useState } from "react";

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const endpointMap = {
    adopter: "/api/adopters",
    staff: "/api/staff",
    volunteer: "/api/volunteers",
  };

  // CREATE / UPDATE helper
  const sendRequest = async (method) => {
    try {
      const res = await fetch(
        `${endpointMap[type]}/${method === "PUT" ? form.userId : ""}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error);
        return;
      }

      setIsError(false);
      setMessage(data.message || "Success");
    } catch {
      setIsError(true);
      setMessage("Network error");
    }
  };

  const handleCreate = () => sendRequest("POST");
  const handleUpdate = () => sendRequest("PUT");

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${endpointMap[type]}/${form.userId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error);
        return;
      }

      setIsError(false);
      setMessage("Deleted successfully");
    } catch {
      setIsError(true);
      setMessage("Network error");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Type Manager</h2>

      {/* TYPE SELECT */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="adopter">Adopter</option>
        <option value="staff">Staff</option>
        <option value="volunteer">Volunteer</option>
      </select>

      {/* COMMON FIELD */}
      <input
        name="userId"
        placeholder="User ID"
        value={form.userId}
        onChange={handleChange}
        style={styles.input}
      />

      {/* ADOPTER FIELDS */}
      {type === "adopter" && (
        <>
          <input
            name="qualificationNotes"
            placeholder="Qualification Notes"
            value={form.qualificationNotes}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="blacklistFlag"
            placeholder="Blacklist Flag (0 or 1)"
            value={form.blacklistFlag}
            onChange={handleChange}
            style={styles.input}
          />
        </>
      )}

      {/* STAFF + VOLUNTEER */}
      {(type === "staff" || type === "volunteer") && (
        <input
          name="supervisor"
          placeholder="Supervisor User ID"
          value={form.supervisor}
          onChange={handleChange}
          style={styles.input}
        />
      )}

      {/* BUTTONS */}
      <div style={styles.buttonGroup}>
        <button onClick={handleCreate}>Create</button>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
      </div>

      <p style={{ color: isError ? "red" : "green" }}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
    margin: "20px",
  },

  input: {
    padding: "8px",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
  },

  button: {
    padding: "8px",
  },
};