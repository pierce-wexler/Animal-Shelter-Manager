
import { useState, useEffect } from "react";
import "./Manager.css";

export default function RecordManager() {
  const token = localStorage.getItem("token");

  const [recordType, setRecordType] = useState("medical");

  const [form, setForm] = useState({
    recordId: "",
    petId: "",
    dateOfRecord: "",
    notes: "",

    // Medical
    institution: "",
    vet: "",

    // Adoption / Foster
    adopterId: "",
    staffId: "",

    // Foster
    status: "",
  });

  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =====================================
  // LOAD RECORDS
  // =====================================
  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // =====================================
  // HANDLE INPUT
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // ENDPOINT MAP
  // =====================================
  const endpointMap = {
    medical: "/api/medical-records",
    adoption: "/api/adoption-records",
    foster: "/api/foster-records",
  };

  // =====================================
  // CRUD ACTIONS
  // =====================================
  const handleAction = async (method) => {
    try {
      let url = "";

      if (method === "DELETE") {
        url = `/api/records/${form.recordId}`;
      } else if (method === "PUT") {
        url = `/api/records/${form.recordId}`;
      } else {
        url = endpointMap[recordType];
      }

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (method !== "DELETE") {
        options.body = JSON.stringify({
          ...form,
          recordType,
        });
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (res.ok) fetchRecords();

    } catch {
      setIsError(true);
      setMessage("Server error");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">
        Pet Record Management
      </h2>

      {/* FORM */}
      <div className="form-container">

        <label className="input-label">
          Record Type
        </label>

        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="custom-input"
        >
          <option value="medical">Medical</option>
          <option value="adoption">Adoption</option>
          <option value="foster">Foster</option>
        </select>

        <label className="input-label">
          Record ID (Update/Delete)
        </label>

        <input
          name="recordId"
          placeholder="Record ID"
          value={form.recordId}
          onChange={handleChange}
          className="custom-input"
        />

        <div className="input-row">
          <input
            name="petId"
            placeholder="Pet ID"
            value={form.petId}
            onChange={handleChange}
            className="custom-input"
          />

          <input
            type="date"
            name="dateOfRecord"
            value={form.dateOfRecord}
            onChange={handleChange}
            className="custom-input"
          />
        </div>

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="custom-input"
          style={{ height: "70px" }}
        />

        {/* MEDICAL */}
        {recordType === "medical" && (
          <>
            <input
              name="institution"
              placeholder="Institution"
              value={form.institution}
              onChange={handleChange}
              className="custom-input"
            />

            <input
              name="vet"
              placeholder="Veterinarian"
              value={form.vet}
              onChange={handleChange}
              className="custom-input"
            />
          </>
        )}

        {/* ADOPTION */}
        {recordType === "adoption" && (
          <div className="input-row">
            <input
              name="adopterId"
              placeholder="Adopter ID"
              value={form.adopterId}
              onChange={handleChange}
              className="custom-input"
            />

            <input
              name="staffId"
              placeholder="Staff ID"
              value={form.staffId}
              onChange={handleChange}
              className="custom-input"
            />
          </div>
        )}

        {/* FOSTER */}
        {recordType === "foster" && (
          <>
            <div className="input-row">
              <input
                name="adopterId"
                placeholder="Adopter ID"
                value={form.adopterId}
                onChange={handleChange}
                className="custom-input"
              />

              <input
                name="staffId"
                placeholder="Staff ID"
                value={form.staffId}
                onChange={handleChange}
                className="custom-input"
              />
            </div>

            <input
              name="status"
              placeholder="Foster Status"
              value={form.status}
              onChange={handleChange}
              className="custom-input"
            />
          </>
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

      {/* TABLE */}
      <div style={{ marginTop: "30px" }}>
        <h3>Current Records</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet</th>
              <th>Date</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.recordId}>
                <td>{record.recordId}</td>
                <td>{record.petId}</td>
                <td>{record.dateOfRecord}</td>
                <td>{record.recordType}</td>
                <td>{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
