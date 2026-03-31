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
    // Foster specific (Updated to match backend)
    fosterParentId: "", 
    startDate: "",
    endDate: "",
    // Adoption specific (Updated to match backend)
    adopterId: "",
    adoptionDate: "",
    feePaid: ""
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
    // 1. Determine the URL
    // If DELETE, always use the master record route.
    // If PUT/POST, use the specific subclass route.
    let url = "";
    if (method === "DELETE") {
      url = `/api/records/${form.recordId}`;
    } else {
      url = `${endpointMap[recordType]}${method === "PUT" ? `/${form.recordId}` : ""}`;
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
          <input name="recordId" placeholder="Record ID (For Update/Delete)" value={form.recordId} onChange={handleChange} className="custom-input" />
          <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} className="custom-input" />
        </div>
        
        <label className="input-label" style={{fontSize: '11px'}}>Date of Entry</label>
        <input name="dateOfRecord" type="date" value={form.dateOfRecord} onChange={handleChange} className="custom-input" />
        <textarea name="notes" placeholder="Notes/Observations" value={form.notes} onChange={handleChange} className="custom-input" style={{ height: '60px' }} />

        <label className="input-label">{recordType.toUpperCase()} Details</label>
        
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
            <input name="fosterParentId" placeholder="Foster Parent ID" value={form.fosterParentId} onChange={handleChange} className="custom-input" />
            <div className="input-row">
              <div style={{flex:1}}>
                <label className="input-label" style={{fontSize: '10px'}}>Start Date</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="custom-input" />
              </div>
              <div style={{flex:1}}>
                <label className="input-label" style={{fontSize: '10px'}}>End Date</label>
                <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="custom-input" />
              </div>
            </div>
          </>
        )}

        {/* ADOPTION FIELDS */}
        {recordType === "adoption" && (
          <>
            <input name="adopterId" placeholder="Adopter ID" value={form.adopterId} onChange={handleChange} className="custom-input" />
            <div className="input-row">
              <div style={{flex:1}}>
                <label className="input-label" style={{fontSize: '10px'}}>Adoption Date</label>
                <input name="adoptionDate" type="date" value={form.adoptionDate} onChange={handleChange} className="custom-input" />
              </div>
              <div style={{flex:1}}>
                <label className="input-label" style={{fontSize: '10px'}}>Fee Paid ($)</label>
                <input name="feePaid" type="number" placeholder="0.00" value={form.feePaid} onChange={handleChange} className="custom-input" />
              </div>
            </div>
          </>
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