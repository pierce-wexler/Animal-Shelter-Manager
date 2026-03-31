// File generated via Chatgpt
import { useState } from "react";

export default function EventManager() {
  const [form, setForm] = useState({
    eventId: "",
    eventType: "",
    eventDateTime: "",
    staffId: "",
    volunteerId: "",
    adopterId: "",
    petId: "",
    location: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Event created");
    } catch {
      setMessage("Error creating event");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/events/${form.eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Event updated");
    } catch {
      setMessage("Error updating event");
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/events/${form.eventId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Event deleted");
    } catch {
      setMessage("Error deleting event");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Event Manager</h2>

      <input name="eventId" placeholder="Event ID" value={form.eventId} onChange={handleChange} style={styles.input} />

      <input name="eventType" placeholder="Event Type" value={form.eventType} onChange={handleChange} style={styles.input} />

      {/* ✅ UPDATED INPUT */}
      <input
        type="datetime-local"
        name="eventDateTime"
        value={form.eventDateTime}
        onChange={handleChange}
        style={styles.input}
      />

      <input name="staffId" placeholder="Staff ID" value={form.staffId} onChange={handleChange} style={styles.input} />

      <input name="volunteerId" placeholder="Volunteer ID (optional)" value={form.volunteerId} onChange={handleChange} style={styles.input} />

      <input name="adopterId" placeholder="Adopter ID" value={form.adopterId} onChange={handleChange} style={styles.input} />

      <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} style={styles.input} />

      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={styles.input} />

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleCreate}>Create</button>
        <button style={styles.button} onClick={handleUpdate}>Update</button>
        <button style={styles.button} onClick={handleDelete}>Delete</button>
      </div>

      <p>{message}</p>
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