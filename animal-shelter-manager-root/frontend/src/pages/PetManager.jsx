
import { useState, useEffect } from "react";
import "./Manager.css";

export default function PetManager() {
  const token = localStorage.getItem("token");
  const [imageVersion, setImageVersion] = useState(Date.now());

  // ================= PET STATE =================
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
    status: "Available",
  });

  const [pets, setPets] = useState([]);
  const [kennels, setKennels] = useState([]);

  const [petMessage, setPetMessage] = useState("");
  const [petIsError, setPetIsError] = useState(false);

  // 🔥 NEW SELECTION STATE
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedKennelId, setSelectedKennelId] = useState(null);

  // ================= KENNEL STATE =================
  const [kennelForm, setKennelForm] = useState({
    kennelId: "",
    roomNo: "",
    occupationStatus: "0",
  });

  const [kennelMessage, setKennelMessage] = useState("");
  const [kennelIsError, setKennelIsError] = useState(false);

  // ================= HELPERS =================
  const calcAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calcDays = (date) => {
    if (!date) return "";
    const diff = new Date() - new Date(date);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // ================= FETCH =================
  const fetchPets = async () => {
    const res = await fetch("/api/pets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setPets(data);
  };

  const fetchKennels = async () => {
    const res = await fetch("/api/kennels", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setKennels(data);
  };

  useEffect(() => {
    fetchPets();
    fetchKennels();
  }, []);

  // ================= HANDLERS =================
  const handlePetChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...petForm, [name]: value };

    if (name === "dateOfBirth") {
      updated.age = calcAge(value);
    }

    if (name === "dateOfAdmittance") {
      updated.daysInShelter = calcDays(value);
    }

    // 🔥 CLEAR SELECTION IF USER TYPES ID
    if (name === "petId") {
      setSelectedPetId(null);
    }

    setPetForm(updated);
  };

  const handleKennelChange = (e) => {
    const updated = {
      ...kennelForm,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "kennelId") {
      setSelectedKennelId(null);
    }

    setKennelForm(updated);
  };

  const handleRowClick = (pet) => {
    setSelectedPetId(pet.petId); // 🔥 highlight

    setPetForm({
      ...pet,
      dateOfBirth: pet.dateOfBirth?.split("T")[0] || "",
      dateOfAdmittance: pet.dateOfAdmittance?.split("T")[0] || "",
    });
  };

  // ================= PET ACTIONS =================
  const handlePetAction = async (method) => {
    const url =
      method === "POST"
        ? "/api/pets"
        : `/api/pets/${petForm.petId}`;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (method !== "DELETE") {
      options.body = JSON.stringify(petForm);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    setPetIsError(!res.ok);
    setPetMessage(data.message || data.error);

    if (res.ok) {
      setSelectedPetId(null);
      setPetForm({
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
        status: "Available",
      });


      fetchPets();
    }
  };

  // ================= KENNEL ACTIONS =================
  const handleKennelAction = async (method) => {
    const url =
      method === "POST"
        ? "/api/kennels"
        : `/api/kennels/${kennelForm.kennelId}`;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (method !== "DELETE") {
      options.body = JSON.stringify(kennelForm);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    setKennelIsError(!res.ok);
    setKennelMessage(data.message || data.error);

    if (res.ok) {
      setSelectedKennelId(null);
      setKennelForm({
        kennelId: "",
        roomNo: "",
        occupationStatus: "0",
      });


      fetchKennels();
    }
  };

  const handleImageUpload = async (file) => {
    if (!petForm.petId) {
      alert("Create or select a pet first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`/api/pets/${petForm.petId}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    alert(data.message);

    setImageVersion(Date.now());
  };

  return (
    <div className="multi-manager-container">
      {/* ================= KENNEL SECTION ================= */}
      <div className="manager-card kennel-section">
        <h2 className="manager-title" style={{ margin: 0 }}>
          Kennel Management
        </h2>


        {selectedKennelId && (
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>
              Editing Kennel ID: {selectedKennelId}
            </span>

            <button
              className="btn"
              style={{ background: "#6b7280" }}
              onClick={() => {
                setSelectedKennelId(null);
                setKennelForm({
                  kennelId: "",
                  roomNo: "",
                  occupationStatus: "0",
                });
              }}
            >
              Stop Editing
            </button>
          </div>
        )}


        <div className="form-container">
          <label className="input-label">Room Number</label>
          <input
            name="roomNo"
            value={kennelForm.roomNo}
            onChange={handleKennelChange}
            className="custom-input"
          />

          <label className="input-label">Occupation Status</label>
          <select
            name="occupationStatus"
            value={kennelForm.occupationStatus}
            onChange={handleKennelChange}
            className="custom-input"
          >
            <option value="0">Vacant</option>
            <option value="1">Occupied</option>
          </select>
        </div>

        <div className="button-group">
          <button onClick={() => handleKennelAction("POST")} className="btn btn-create" disabled={!!selectedKennelId}>Create</button>
          <button onClick={() => handleKennelAction("PUT")} className="btn btn-update" disabled={!selectedKennelId}>Update</button>
          <button onClick={() => handleKennelAction("DELETE")} className="btn btn-delete" disabled={!selectedKennelId}>Delete</button>
        </div>

        {kennelMessage && (
          <div className={`status-message ${kennelIsError ? "error" : "success"}`}>
            {kennelMessage}
          </div>
        )}
        {/* TABLE */}
        <div style={{ marginTop: "25px" }}>
          <h3>Click row to edit</h3>

          <table className="data-table kennel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {kennels.map((k) => (
                <tr
                  key={k.kennelId}
                  onClick={() => {
                    setSelectedKennelId(k.kennelId);
                    setKennelForm({
                      kennelId: k.kennelId,
                      roomNo: k.roomNo,
                      occupationStatus: String(k.occupationStatus),
                    });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{k.kennelId}</td>
                  <td>{k.roomNo}</td>
                  <td>
                    {String(k.occupationStatus) === "1"
                      ? "Occupied"
                      : "Vacant"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PET SECTION ================= */}
      <div className="manager-card pet-section">
        <h2 className="manager-title" style={{ margin: 0 }}>
          Pet Manager
        </h2>

        {selectedPetId && (
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>
              Editing Pet ID: {selectedPetId}
            </span>

            <button
              className="btn-thin"
              style={{ background: "#6b7280" }}
              onClick={() => {
                setSelectedPetId(null);
                setPetForm({
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
                  status: "Available",
                });
              }}
            >
              Stop Editing
            </button>
          </div>
        )}


        {/* FORM */}
        <div className="form-container">

          <label className="input-label">Name</label>
          <input name="name" value={petForm.name} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Date of Birth</label>
          <input type="date" name="dateOfBirth" value={petForm.dateOfBirth} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Age</label>
          <input name="age" value={petForm.age} disabled={!!petForm.dateOfBirth} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Sex</label>
          <select name="sex" value={petForm.sex} onChange={handlePetChange} className="custom-input">
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

          <label className="input-label">Kennel</label>
          <select name="kennelId" value={petForm.kennelId} onChange={handlePetChange} className="custom-input">
            <option value="">Select Kennel</option>
            {kennels.map((k) => (
              <option key={k.kennelId} value={k.kennelId}>
                Kennel {k.kennelId}
              </option>
            ))}
          </select>

          <label className="input-label">Breed</label>
          <input name="breed" value={petForm.breed} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Behavioral Notes</label>
          <textarea name="behavioralNotes" value={petForm.behavioralNotes} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Date of Admittance</label>
          <input type="date" name="dateOfAdmittance" value={petForm.dateOfAdmittance} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Days in Shelter</label>
          <input name="daysInShelter" value={petForm.daysInShelter} disabled className="custom-input" />

          <label className="input-label">Special Notes</label>
          <textarea name="specialNotes" value={petForm.specialNotes} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Status</label>
          <select name="status" value={petForm.status} onChange={handlePetChange} className="custom-input">
            <option value="Available">Available</option>
            <option value="Adopted/Fostered">Adopted/Fostered</option>
          </select>

          <label className="input-label">Pet Image</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="custom-input" />

          {petForm.petId && (
            <img
              src={`http://localhost:5000/uploads/pet-${petForm.petId}.jpg?v=${imageVersion}`}
              alt="preview"
              className="pet-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
          )}
        </div>

        {/* BUTTONS */}
        <div className="button-group">
          <button onClick={() => handlePetAction("POST")} className="btn btn-create" disabled={!!selectedPetId}>Create</button>
          <button onClick={() => handlePetAction("PUT")} className="btn btn-update" disabled={!selectedPetId}>Update</button>
          <button onClick={() => handlePetAction("DELETE")} className="btn btn-delete" disabled={!selectedPetId}>Delete</button>
        </div>

        {petMessage && (
          <div className={`status-message ${petIsError ? "error" : "success"}`}>
            {petMessage}
          </div>
        )}

        {/* ================= PET TABLE ================= */}
        <div style={{ marginTop: "30px" }}>
          <h3>Click row to edit</h3>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Kennel</th>
                <th>Breed</th>
                <th>Behavior</th>
                <th>Days</th>
                <th>Special Notes</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pets.map((pet) => (
                <tr
                  key={pet.petId}
                  onClick={() => handleRowClick(pet)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{pet.petId}</td>

                  <td>{pet.name}</td>

                  <td>
                    {pet.dateOfBirth
                      ? pet.dateOfBirth.split("T")[0]
                      : "—"}
                  </td>

                  <td>{pet.age ?? "—"}</td>

                  <td>{pet.sex || "—"}</td>

                  <td>{pet.kennelId || "—"}</td>

                  <td>{pet.breed || "—"}</td>

                  <td style={{ maxWidth: "150px" }}>
                    {pet.behavioralNotes || "None"}
                  </td>

                  <td>{pet.daysInShelter ?? "—"}</td>

                  <td style={{ maxWidth: "150px" }}>
                    {pet.specialNotes || "None"}
                  </td>

                  <td>{pet.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}

