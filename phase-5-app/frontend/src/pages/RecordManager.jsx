import { useState } from "react";
import "./Manager.css";

export default function RecordManager() {
  const [recordType, setRecordType] = useState("medical");
  const [form, setForm] = useState({
    recordId: "",
    petId: "",
    dateOfRecord: "",
    notes: "",
    // Medical specific
    institution: "",
    vet: "",
    // Foster specific
    status: "",
    fosterEndDate: "",
    // Adoption specific
    adopterId: "",
    staffId: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const endpointMap = {
    medical: "/api/medical-records",
    foster: "/api/foster-records",
    adoption: "/api/adoption-records",
  };

  const handleAction = async (method) => {
    // For POST, we hit the base endpoint. For PUT/DELETE, we append the ID.
    const url = `${endpointMap[recordType]}${method !== "POST" ? `/${form.recordId}` : ""}`;
    
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") {
        // We send the whole form; the backend should handle splitting 
        // data between 'record' and the specific subclass table.
        options.body = JSON.stringify({ ...form, recordType });
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Success");
    } catch (err) {
      setIsError(true);
      setMessage("Network error or server down");
    }
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">Pet Record Management</h2>

      <div className="form-container">
        <label className="input-label">Record Category</label>
        <select className="custom-input" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
          <option value="medical">Medical Record</option>
          <option value="foster">Foster Record</option>
          <option value="adoption">Adoption Record</option>
        </select>

        <label className="input-label">Base Information</label>
        <div className="input-row">
          <input name="recordId" placeholder="Record ID" value={form.recordId} onChange={handleChange} className="custom-input" />
          <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} className="custom-input" />
        </div>
        
        <input name="dateOfRecord" type="datetime-local" value={form.dateOfRecord} onChange={handleChange} className="custom-input" />
        <textarea name="notes" placeholder="Notes/Observations" value={form.notes} onChange={handleChange} className="custom-input" style={{ height: '80px' }} />

        <label className="input-label">{recordType.toUpperCase()} Specific Details</label>
        
        {/* MEDICAL FIELDS */}
        {recordType === "medical" && (
          <div className="input-row">
            <input name="institution" placeholder="Clinic Name" value={form.institution} onChange={handleChange} className="custom-input" />
            <input name="vet" placeholder="Vet Name" value={form.vet} onChange={handleChange} className="custom-input" />
          </div>
        )}

        {/* FOSTER FIELDS */}
        {recordType === "foster" && (
          <>
            <input name="status" placeholder="Foster Status (e.g. Active)" value={form.status} onChange={handleChange} className="custom-input" />
            <label className="input-label" style={{fontSize: '10px'}}>Foster End Date</label>
            <input name="fosterEndDate" type="datetime-local" value={form.fosterEndDate} onChange={handleChange} className="custom-input" />
          </>
        )}

        {/* ADOPTION FIELDS */}
        {recordType === "adoption" && (
          <div className="input-row">
            <input name="adopterId" placeholder="Adopter ID" value={form.adopterId} onChange={handleChange} className="custom-input" />
            <input name="staffId" placeholder="Staff ID" value={form.staffId} onChange={handleChange} className="custom-input" />
          </div>
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