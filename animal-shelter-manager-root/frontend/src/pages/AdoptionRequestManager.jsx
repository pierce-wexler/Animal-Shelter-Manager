import { useState } from "react";
import "./Manager.css"; // Ensure this matches your PetManager's CSS file

const BASE_URL = "http://localhost:5000";

export default function AdoptionRequestManager() {
  const [form, setForm] = useState({
    requestId: "",
    submitterId: "",
    petId: "",
    description: "",
    status: "",
    fulfilledBy: "",
    adoptionType: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAction = async (method) => {
    const url = `${BASE_URL}/api/adoption-requests${method !== "POST" ? `/${form.requestId}` : ""}`;
    
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") options.body = JSON.stringify(form);

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error || "Operation successful");
    } catch {
      setIsError(true);
      setMessage("Network error: Ensure backend is running");
    }
  };

  return (
    <div className="multi-manager-container">
      <div className="manager-card">
        <h2 className="manager-title">Adoption Request Management</h2>
        
        <div className="form-container">
          <label className="input-label">Identification</label>
          <div className="input-row">
            <input name="requestId" placeholder="Req ID" value={form.requestId} onChange={handleChange} className="custom-input" />
            <input name="submitterId" placeholder="Adopter ID" value={form.submitterId} onChange={handleChange} className="custom-input" />
          </div>

          <label className="input-label">Subject & Type</label>
          <div className="input-row">
            <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} className="custom-input" />
            <input name="adoptionType" placeholder="Type (Adoption/Foster)" value={form.adoptionType} onChange={handleChange} className="custom-input" />
          </div>

          <label className="input-label">Status & Assignment</label>
          <div className="input-row">
            <input name="status" placeholder="Status" value={form.status} onChange={handleChange} className="custom-input" />
            <input name="fulfilledBy" placeholder="Staff ID (Optional)" value={form.fulfilledBy} onChange={handleChange} className="custom-input" />
          </div>

          <label className="input-label">Notes</label>
          <textarea 
            name="description" 
            placeholder="Detailed description of the request..." 
            value={form.description} 
            onChange={handleChange} 
            className="custom-input" 
            style={{ height: '80px' }} 
          />
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
    </div>
  );
}