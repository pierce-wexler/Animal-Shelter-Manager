import { useState, useEffect } from "react";
import "./Manager.css";

export default function AdoptionRequestManager() {
  const token = localStorage.getItem("token");

  const emptyForm = {
    requestId: "",
    submitterId: "",
    petId: "",
    description: "",
    status: "",
    fufilledBy: "",
    adoptionType: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // =====================================
  // LOAD REQUESTS
  // =====================================
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/adoption-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setRequests(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================
  // RESET
  // =====================================
  const resetForm = () => {
    setSelectedRequestId(null);
    setForm(emptyForm);
  };

  // =====================================
  // INPUT
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
  const handleRowClick = (req) => {
    setSelectedRequestId(req.requestId);

    setForm({
      ...req,
    });
  };

  // =====================================
  // CRUD (UNIFIED)
  // =====================================
  const handleAction = async (method) => {
    try {
      if (method === "DELETE") {
        if (!window.confirm("Delete this request?")) return;
      }

      const url =
        method === "POST"
          ? "/api/adoption-requests"
          : `/api/adoption-requests/${form.requestId}`;

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
        fetchRequests();
        return;
      }

      fetchRequests();

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
      <h2 className="manager-title">
        Adoption Request Management
      </h2>

      {/* EDIT MODE */}
      {selectedRequestId && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px"
        }}>
          <span style={{ fontWeight: 600, color: "#2563eb" }}>
            Editing Request ID: {selectedRequestId}
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

        <label className="input-label">
          Request Owner
        </label>

        <input
          name="submitterId"
          placeholder="Adopter ID"
          value={form.submitterId}
          onChange={handleChange}
          className="custom-input"
        />

        <label className="input-label">
          Pet + Type
        </label>

        <div className="input-row">
          <input
            name="petId"
            placeholder="Pet ID"
            value={form.petId}
            onChange={handleChange}
            className="custom-input"
          />

          <select
            name="adoptionType"
            value={form.adoptionType}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Type</option>
            <option value="adoption">Adoption</option>
            <option value="foster">Foster</option>
          </select>
        </div>

        <label className="input-label">
          Status + Staff
        </label>

        <div className="input-row">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="custom-input"
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="completed">Completed</option>
          </select>

          <input
            name="fufilledBy"
            placeholder="Staff ID"
            value={form.fufilledBy}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <label className="input-label">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Request notes..."
          value={form.description}
          onChange={handleChange}
          className="custom-input"
          style={{ height: "80px" }}
        />
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          onClick={() => handleAction("POST")}
          className="btn btn-create"
          disabled={!!selectedRequestId}
        >
          Create
        </button>

        <button
          onClick={() => handleAction("PUT")}
          className="btn btn-update"
          disabled={!selectedRequestId}
        >
          Update
        </button>

        <button
          onClick={() => handleAction("DELETE")}
          className="btn btn-delete"
          disabled={!selectedRequestId}
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
                <th>Submitter</th>
                <th>Pet</th>
                <th>Type</th>
                <th>Status</th>
                <th>Handled By</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.requestId}
                  onClick={() => handleRowClick(req)}
                  className={
                    selectedRequestId == req.requestId
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{req.requestId}</td>
                  <td>{req.submitterId}</td>
                  <td>{req.petId}</td>
                  <td>{req.adoptionType}</td>
                  <td>{req.status}</td>
                  <td>{req.fufilledBy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}