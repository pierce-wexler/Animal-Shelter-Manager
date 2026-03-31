import { useState } from "react";
import "./Manager.css";

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
    const url = `/api/pets${method !== "POST" ? `/${petForm.petId}` : ""}`;
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") options.body = JSON.stringify(petForm);
      const res = await fetch(url, options);
      const data = await res.json();
      setPetIsError(!res.ok);
      setPetMessage(data.message || data.error || "Pet operation successful");
    } catch {
      setPetIsError(true);
      setPetMessage("Network error");
    }
  };

  const handleKennelAction = async (method) => {
    const url = `/api/kennels${method !== "POST" ? `/${kennelForm.kennelId}` : ""}`;
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (method !== "DELETE") options.body = JSON.stringify(kennelForm);
      const res = await fetch(url, options);
      const data = await res.json();
      setKennelIsError(!res.ok);
      setKennelMessage(data.message || data.error || "Kennel operation successful");
    } catch {
      setKennelIsError(true);
      setKennelMessage("Network error");
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