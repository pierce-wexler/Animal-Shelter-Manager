import { useState, useEffect } from "react";
import "./Manager.css";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function EventManager() {
  const token = localStorage.getItem("token");

  const emptyForm = {
    eventId: "",
    eventType: "",
    eventDateTime: "",
    staffId: "",
    volunteerId: "",
    adopterId: "",
    petId: "",
    location: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [adopters, setAdopters] = useState([]);
  const [pets, setPets] = useState([]);

  // =====================================
  // LOAD EVENTS
  // =====================================
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events/full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setEvents(data);

    } catch (err) {
      console.error(err);
    }
  };

  const fetchParticipants = async () => {
    try {
      const [usersRes, petRes] = await Promise.all([
        fetch("/api/admin/users/full", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/pets", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [usersData, petData] = await Promise.all([
        usersRes.json(),
        petRes.json(),
      ]);

      if (usersRes.ok) {
        const normalize = (r) => (r || "").toLowerCase().trim();

        const staffList = [];
        const volunteerList = [];
        const adopterList = [];

        usersData.forEach((u) => {
          const role = normalize(u.roleType);

          if (role === "staff" || role === "admin") {
            staffList.push(u);
          } else if (role === "volunteer") {
            volunteerList.push(u);
          } else if (role === "adopter") {
            adopterList.push(u);
          }
        });

        setStaff(staffList);
        setVolunteers(volunteerList);
        setAdopters(adopterList);
      }

      if (petRes.ok) {
        setPets(petData);
      }

    } catch (err) {
      console.error("fetchParticipants error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
  }, []);


  // =====================================
  // RESET
  // =====================================
  const resetForm = () => {
    setSelectedEventId(null);
    setForm(emptyForm);
  };

  // =====================================
  // INPUT CHANGE
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // ROW CLICK (EDIT MODE)
  // =====================================
  const handleRowClick = (event) => {
    setSelectedEventId(event.eventId);

    setForm({
      ...event,
      eventDateTime: event.eventDateTime
        ? event.eventDateTime.slice(0, 16) // fix datetime-local format
        : "",
    });
  };

  // =====================================
  // CRUD ACTION (UNIFIED)
  // =====================================
  const handleAction = async (method) => {
    try {
      if (method === "DELETE") {
        if (!window.confirm("Delete this event?")) return;
      }

      const url =
        method === "POST"
          ? "/api/events"
          : `/api/events/${form.eventId}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(method !== "DELETE" && {
          body: JSON.stringify(form),
        }),
      });

      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (!res.ok) return;

      // DELETE
      if (method === "DELETE") {
        resetForm();
        fetchEvents();
        return;
      }

      fetchEvents();

      // CREATE reset
      if (method === "POST") {
        setTimeout(resetForm, 300);
      }

    } catch {
      setIsError(true);
      setMessage("Server error");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">Event Management</h2>

      {/* EDIT MODE */}
      {selectedEventId && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px"
        }}>
          <span style={{ fontWeight: 600, color: "#2563eb" }}>
            Editing Event ID: {selectedEventId}
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
        <div style={{display: "flex", justifyContent: "center"}}>
          <div style={{ marginTop: "20px", width: "80vw", margin: "0 auto" }}>
            <FullCalendar
              height="400px"
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              selectable={true}
              slotMinTime="09:00:00"
              slotMaxTime="18:00:00"
              events={events.map(e => ({
                title: e.eventType,
                start: e.eventDateTime
              }))}

              select={(info) => {
                // user clicks a time slot
                setForm({
                  ...form,
                  eventDateTime: info.startStr.slice(0, 16)
                });
              }}
            />
          </div>
        </div>
        <label className="input-label">Participants</label>

        <div className="input-row">
          <select
            name="staffId"
            value={form.staffId}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Staff</option>
            {staff.map((s) => (
              <option key={s.userId} value={s.userId}>
                #{s.userId} – {s.fname} {s.lname}
              </option>
            ))}
          </select>

          <select
            name="petId"
            value={form.petId}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Pet</option>
            {pets.map((p) => (
              <option key={p.petId} value={p.petId}>
                #{p.petId} – {p.name} ({p.breed || "Unknown"})
              </option>
            ))}
          </select>
        </div>

        <div className="input-row">
          <select
            name="volunteerId"
            value={form.volunteerId}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Volunteer</option>
            {volunteers.map((v) => (
              <option key={v.userId} value={v.userId}>
                #{v.userId} – {v.fname} {v.lname}
              </option>
            ))}
          </select>

          <select
            name="adopterId"
            value={form.adopterId}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Adopter</option>
            {adopters.map((a) => (
              <option key={a.userId} value={a.userId}>
                #{a.userId} – {a.fname} {a.lname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          onClick={() => handleAction("POST")}
          className="btn btn-create"
          disabled={!!selectedEventId}
        >
          Create
        </button>

        <button
          onClick={() => handleAction("PUT")}
          className="btn btn-update"
          disabled={!selectedEventId}
        >
          Update
        </button>

        <button
          onClick={() => handleAction("DELETE")}
          className="btn btn-delete"
          disabled={!selectedEventId}
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
        <h3>Click row to edit</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Date/Time</th>
                <th>Location</th>

                <th>Staff ID</th>
                <th>Staff Name</th>

                <th>Volunteer ID</th>
                <th>Volunteer Name</th>

                <th>Adopter ID</th>
                <th>Adopter Name</th>

                <th>Pet ID</th>
                <th>Pet Name</th>
                <th>Breed</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event.eventId}
                  onClick={() => handleRowClick(event)}
                  className={
                    selectedEventId == event.eventId
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{event.eventId}</td>

                  <td>{event.eventType}</td>

                  <td>
                    {event.eventDateTime
                      ? event.eventDateTime.replace("T", " ")
                      : "—"}
                  </td>

                  <td>{event.location || "—"}</td>

                  {/* STAFF */}
                  <td>{event.staffId || "—"}</td>
                  <td>{event.staffName || "—"}</td>

                  {/* VOLUNTEER */}
                  <td>{event.volunteerId || "—"}</td>
                  <td>{event.volunteerName || "—"}</td>

                  {/* ADOPTER */}
                  <td>{event.adopterId || "—"}</td>
                  <td>{event.adopterName || "—"}</td>

                  {/* PET */}
                  <td>{event.petId || "—"}</td>
                  <td>{event.petName || "—"}</td>
                  <td>{event.petBreed || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}