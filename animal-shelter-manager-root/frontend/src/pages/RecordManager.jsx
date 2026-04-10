import { useState, useEffect } from "react";
import "./Manager.css";

export default function RecordManager() {
  const [recordType, setRecordType] = useState("medical");

  const [form, setForm] = useState({
    recordId: "",
    petId: "",
    dateOfRecord: "",
    recordType: "medical",
    notes: "",

    // Medical
    institution: "",
    vet: "",

    // Adoption
    adopterId: "",
    staffId: "",

    // Foster
    status: "",
    fosterEndDate: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Keep recordType synced with form
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      recordType: recordType,
    }));
  }, [recordType]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const endpointMap = {
    medical: "/api/medical-records",
    foster: "/api/foster-records",
    adoption: "/api/adoption-records",
  };

  const handleAction = async (method) => {
    let url = "";

    if (method === "DELETE") {
      url = `/api/records/${form.recordId}`;
    } else {
      url = `${endpointMap[recordType]}${
        method === "PUT" ? `/${form.recordId}` : ""
      }`;
    }

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method !== "DELETE") {
        options.body = JSON.stringify(form);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Success");
    } catch {
      setIsError(true);
      setMessage("Network error or server down");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">Pet Record Management</h2>

      <div className="form-container">
        {/* RECORD TYPE */}
        <label className="input-label">Record Category</label>
        <select
          className="custom-input"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
        >
          <option value="medical">Medical Record</option>
          <option value="foster">Foster Record</option>
          <option value="adoption">Adoption Record</option>
        </select>

        {/* BASE FIELDS */}
        <label className="input-label">Base Information</label>
        <div className="input-row">
          <input
            name="recordId"
            placeholder="Record ID (for update/delete)"
            value={form.recordId}
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

        <label className="input-label" style={{ fontSize: "11px" }}>
          Date of Record
        </label>
        <input
          name="dateOfRecord"
          type="date"
          value={form.dateOfRecord}
          onChange={handleChange}
          className="custom-input"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="custom-input"
          style={{ height: "60px" }}
        />

        {/* SUBCLASS SECTION */}
        <label className="input-label">
          {recordType.toUpperCase()} Details
        </label>

        {/* MEDICAL */}
        {recordType === "medical" && (
          <div className="input-row">
            <input
              name="institution"
              placeholder="Institution"
              value={form.institution}
              onChange={handleChange}
              className="custom-input"
            />
            <input
              name="vet"
              placeholder="Vet"
              value={form.vet}
              onChange={handleChange}
              className="custom-input"
            />
          </div>
        )}

        {/* FOSTER */}
        {recordType === "foster" && (
  <>
    {/* Adoption layer (REQUIRED for foster) */}
    <input
      name="adopterId"
      placeholder="Adopter ID"
      value={form.adopterId}
      onChange={handleChange}
      className="custom-input"
    />

    <input
      name="staffId"
      placeholder="Staff ID (fulfilled by)"
      value={form.staffId}
      onChange={handleChange}
      className="custom-input"
    />

    {/* Foster-specific fields */}
    <input
      name="status"
      placeholder="Foster Status"
      value={form.status}
      onChange={handleChange}
      className="custom-input"
    />

    <label className="input-label" style={{ fontSize: "10px" }}>
      Foster End Date
    </label>
    <input
      name="fosterEndDate"
      type="date"
      value={form.fosterEndDate}
      onChange={handleChange}
      className="custom-input"
    />
  </>
)}

        {/* ADOPTION */}
        {recordType === "adoption" && (
          <>
            <input
              name="adopterId"
              placeholder="Adopter ID"
              value={form.adopterId}
              onChange={handleChange}
              className="custom-input"
            />

            <input
              name="staffId"
              placeholder="Staff ID (fulfilled by)"
              value={form.staffId}
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

      {/* MESSAGE */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}