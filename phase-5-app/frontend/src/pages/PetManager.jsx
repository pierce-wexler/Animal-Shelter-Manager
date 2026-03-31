import { useState } from "react";
import "./Manager.css";

// Define the backend location
const BASE_URL = "http://localhost:5000";

export default function PetManager() {
  // --- PET STATE ---
  const [petForm, setPetForm] = useState({
    petId: "",
    name: "",
    dateOfBirth: "",
    age: "",
    sex: "",
    kennelId: "",
    breed: "",
    behavioralNotes: "",
    dateOfAdmittance: "",
    daysInShelter: "",
    specialNotes: "",
    status: "",
  });
  const [petMessage, setPetMessage] = useState("");
  const [petIsError, setPetIsError] = useState(false);

  // --- KENNEL STATE ---
  const [kennelForm, setKennelForm] = useState({
    kennelId: "",
    roomNo: "",
    occupationStatus: "",
  });
  const [kennelMessage, setKennelMessage] = useState("");
  const [kennelIsError, setKennelIsError] = useState(false);

  // --- HANDLERS ---
  const handlePetChange = (e) => setPetForm({ ...petForm, [e.target.name]: e.target.value });
  const handleKennelChange = (e) => setKennelForm({ ...kennelForm, [e.target.name]: e.target.value });

  const handlePetAction = async (method) => {
    // UPDATED: Added BASE_URL to the request path
    const url = `${BASE_URL}/api/pets${method !== "POST" ? `/${petForm.petId}` : ""}`;
    
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      
      // Don't send a body for DELETE requests
      if (method !== "DELETE") {
        options.body = JSON.stringify(petForm);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        setPetIsError(true);
        setPetMessage(data.error || "Operation failed");
      } else {
        setPetIsError(false);
        setPetMessage(data.message || "Pet operation successful");
      }
    } catch (err) {
      setPetIsError(true);
      setPetMessage("Network error: Ensure backend is running on port 5000");
    }
  };

  const handleKennelAction = async (method) => {
    // UPDATED: Added BASE_URL to the request path
    const url = `${BASE_URL}/api/kennels${method !== "POST" ? `/${kennelForm.kennelId}` : ""}`;
    
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method !== "DELETE") {
        options.body = JSON.stringify(kennelForm);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        setKennelIsError(true);
        setKennelMessage(data.error || "Operation failed");
      } else {
        setKennelIsError(false);
        setKennelMessage(data.message || "Kennel operation successful");
      }
    } catch (err) {
      setKennelIsError(true);
      setKennelMessage("Network error: Ensure backend is running on port 5000");
    }
  };

  return (
    <div className="multi-manager-container">
      {/* PET CARD */}
      <div className="manager-card">
        <h2 className="manager-title">Pet Management</h2>
        <div className="form-container">
          <label className="input-label">Identity</label>
          <div className="input-row">
            <input name="petId" placeholder="ID" value={petForm.petId} onChange={handlePetChange} className="custom-input" />
            <input name="name" placeholder="Name" value={petForm.name} onChange={handlePetChange} className="custom-input" />
          </div>

          <label className="input-label">Details</label>
          <div className="input-row">
            <input name="breed" placeholder="Breed" value={petForm.breed} onChange={handlePetChange} className="custom-input" />
            <input name="sex" placeholder="Sex" value={petForm.sex} onChange={handlePetChange} className="custom-input" />
          </div>

          <label className="input-label">Dates & Status</label>
          <div className="input-row">
             <input name="dateOfBirth" type="date" value={petForm.dateOfBirth} onChange={handlePetChange} className="custom-input" />
             <input name="status" placeholder="Status" value={petForm.status} onChange={handlePetChange} className="custom-input" />
          </div>

          <label className="input-label">Location</label>
          <input name="kennelId" placeholder="Assigned Kennel ID" value={petForm.kennelId} onChange={handlePetChange} className="custom-input" />
          
          <textarea name="behavioralNotes" placeholder="Behavioral Notes..." value={petForm.behavioralNotes} onChange={handlePetChange} className="custom-input" style={{height: '60px'}} />
        </div>

        <div className="button-group">
          <button onClick={() => handlePetAction("POST")} className="btn btn-create">Create</button>
          <button onClick={() => handlePetAction("PUT")} className="btn btn-update">Update</button>
          <button onClick={() => handlePetAction("DELETE")} className="btn btn-delete">Delete</button>
        </div>
        {petMessage && <div className={`status-message ${petIsError ? "error" : "success"}`}>{petMessage}</div>}
      </div>

      {/* KENNEL CARD */}
      <div className="manager-card">
        <h2 className="manager-title">Kennel Management</h2>
        <div className="form-container">
          <label className="input-label">Unit Details</label>
          <input name="kennelId" placeholder="Kennel ID" value={kennelForm.kennelId} onChange={handleKennelChange} className="custom-input" />
          <input name="roomNo" placeholder="Room Number" value={kennelForm.roomNo} onChange={handleKennelChange} className="custom-input" />
          <input name="occupationStatus" placeholder="Occupation Status (0/1)" value={kennelForm.occupationStatus} onChange={handleKennelChange} className="custom-input" />
        </div>

        <div className="button-group">
          <button onClick={() => handleKennelAction("POST")} className="btn btn-create">Create</button>
          <button onClick={() => handleKennelAction("PUT")} className="btn btn-update">Update</button>
          <button onClick={() => handleKennelAction("DELETE")} className="btn btn-delete">Delete</button>
        </div>
        {kennelMessage && <div className={`status-message ${kennelIsError ? "error" : "success"}`}>{kennelMessage}</div>}
      </div>
    </div>
  );
}