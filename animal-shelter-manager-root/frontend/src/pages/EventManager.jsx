import { useState } from "react";
import "./Manager.css";

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
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // --- PARTNER'S ORIGINAL LOGIC LINES START ---
  
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
        setIsError(true); // Added for your styling
        setMessage(data.error);
        return;
      }

      setIsError(false);
      setMessage("Event created");
    } catch {
      setIsError(true);
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
        setIsError(true);
        setMessage(data.error);
        return;
      }

      setIsError(false);
      setMessage("Event updated");
    } catch {
      setIsError(true);
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
        setIsError(true);
        setMessage(data.error);
        return;
      }

      setIsError(false);
      setMessage("Event deleted");
    } catch {
      setIsError(true);
      setMessage("Error deleting event");
    }
  };

  // --- PARTNER'S ORIGINAL LOGIC LINES END ---

  return (
    <div className="manager-card">
      <h2 className="manager-title">Event Manager</h2>

      <div className="form-container">
        <label className="input-label">Event Identification</label>
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

        <label className="input-label">Participants (IDs)</label>
        <div className="input-row">
          <input name="staffId" placeholder="Staff ID" value={form.staffId} onChange={handleChange} className="custom-input" />
          <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} className="custom-input" />
        </div>
        
        <div className="input-row">
          <input name="volunteerId" placeholder="Volunteer ID" value={form.volunteerId} onChange={handleChange} className="custom-input" />
          <input name="adopterId" placeholder="Adopter ID" value={form.adopterId} onChange={handleChange} className="custom-input" />
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleCreate} className="btn btn-create">Create</button>
        <button onClick={handleUpdate} className="btn btn-update">Update</button>
        <button onClick={handleDelete} className="btn btn-delete">Delete</button>
      </div>

      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}