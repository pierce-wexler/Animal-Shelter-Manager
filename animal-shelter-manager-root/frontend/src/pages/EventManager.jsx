
import { useState, useEffect } from "react";
import "./Manager.css";

export default function EventManager() {
  const token = localStorage.getItem("token");

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

  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =====================================
  // LOAD EVENTS
  // =====================================
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // =====================================
  // FORM HANDLER
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // CREATE
  // =====================================
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (res.ok) fetchEvents();

    } catch {
      setIsError(true);
      setMessage("Error creating event");
    }
  };

  // =====================================
  // UPDATE
  // =====================================
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/events/${form.eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (res.ok) fetchEvents();

    } catch {
      setIsError(true);
      setMessage("Error updating event");
    }
  };

  // =====================================
  // DELETE
  // =====================================
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/events/${form.eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (res.ok) fetchEvents();

    } catch {
      setIsError(true);
      setMessage("Error deleting event");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">Event Management</h2>

      {/* FORM */}
      <div className="form-container">

        <label className="input-label">
          Event ID (Update/Delete)
        </label>

        <input
          name="eventId"
          placeholder="Event ID"
          value={form.eventId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Basic Info</label>

        <div className="input-row">
          <input
            name="eventType"
            placeholder="Event Type"
            value={form.eventType}
            onChange={handleChange}
            className="custom-input"
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <label className="input-label">Date & Time</label>

        <input
          type="datetime-local"
          name="eventDateTime"
          value={form.eventDateTime}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">Participants</label>

        <div className="input-row">
          <input
            name="staffId"
            placeholder="Staff ID"
            value={form.staffId}
            onChange={handleChange}
            className="custom-input"
          />

          <input
            name="petId"
            placeholder="Pet ID"
            value={form.petId}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <div className="input-row">
          <input
            name="volunteerId"
            placeholder="Volunteer ID"
            value={form.volunteerId}
            onChange={handleChange}
            className="custom-input"
          />

          <input
            name="adopterId"
            placeholder="Adopter ID"
            value={form.adopterId}
            onChange={handleChange}
            className="custom-input"
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          onClick={handleCreate}
          className="btn btn-create"
        >
          Create
        </button>

        <button
          onClick={handleUpdate}
          className="btn btn-update"
        >
          Update
        </button>

        <button
          onClick={handleDelete}
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

      {/* TABLE */}
      <div style={{ marginTop: "30px" }}>
        <h3>Current Events</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Date/Time</th>
              <th>Location</th>
              <th>Staff</th>
              <th>Volunteer</th>
              <th>Adopter</th>
              <th>Pet</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventId}</td>
                <td>{event.eventType}</td>
                <td>{event.eventDateTime}</td>
                <td>{event.location}</td>
                <td>{event.staffId}</td>
                <td>{event.volunteerId}</td>
                <td>{event.adopterId}</td>
                <td>{event.petId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
