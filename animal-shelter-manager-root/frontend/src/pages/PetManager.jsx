
import { useState, useEffect } from "react";
import "./Manager.css";

export default function PetManager() {
  const token = localStorage.getItem("token");
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
    setSelectedPetId(pet.petId);

    setPetForm({
      ...pet,
      dateOfBirth: pet.dateOfBirth?.split("T")[0] || "",
      dateOfAdmittance: pet.dateOfAdmittance?.split("T")[0] || "",
    });
  };

  const emptyPet = {
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
  };

  const resetPetForm = () => {
    setSelectedPetId(null);
    setPetForm(emptyPet);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const uploadImage = async (petId) => {
    if (!selectedFile || !petId) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    await fetch(`/api/pets/${petId}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    setImageVersion(Date.now());
    setSelectedFile(null);
  };

  // ================= PET ACTIONS =================
  const handlePetAction = async (method) => {
    if (method === "DELETE") {
      if (!window.confirm("Delete this pet?")) return;
    }

    const url =
      method === "POST"
        ? "/api/pets"
        : `/api/pets/${petForm.petId}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(method !== "DELETE" && { body: JSON.stringify(petForm) }),
    });

    const data = await res.json();

    setPetIsError(!res.ok);
    setPetMessage(data.message || data.error);

    if (!res.ok) return;

    // 🔴 DELETE
    if (method === "DELETE") {
      resetPetForm();
      fetchPets();
      return;
    }

    // Determine correct ID
    const petId = method === "POST" ? data.petId : petForm.petId;

    // Keep selection for update flow
    setSelectedPetId(petId);
    setPetForm((prev) => ({ ...prev, petId }));

    // Upload image if needed
    await uploadImage(petId);

    setPreviewUrl(null);
    fetchPets();

    // Reset only after create
    if (method === "POST") {
      setTimeout(resetPetForm, 500);
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

  const statusMap = {
    "0": "Vacant",
    "1": "Occupied",
    "2": "Full",
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
            placeholder="Number of room holding kennel"
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
            <option value="2">Full</option>
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
          <div className="table-container">
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
                    className={
                      selectedKennelId == k.kennelId ? "selected-row" : ""
                    }
                  >
                    <td>{k.kennelId}</td>
                    <td>{k.roomNo}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color:
                          String(k.occupationStatus) === "0"
                            ? "green"
                            : String(k.occupationStatus) === "1"
                              ? "#f59e0b"
                              : "red",
                      }}
                    >
                      {{
                        "0": "Vacant",
                        "1": "Occupied",
                        "2": "Full",
                      }[String(k.occupationStatus)] || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <input name="name" placeholder="Name of animal" value={petForm.name} onChange={handlePetChange} className="custom-input" />
          <div className="input-row">
            <div style={{ width: "100%" }}>
              <label className="input-label">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={petForm.dateOfBirth} onChange={handlePetChange} className="custom-input" />
            </div>
            <div style={{ width: "100%" }}>
              <label className="input-label">Age</label>
              <input name="age" placeholder="Not req. if DOB specified" value={petForm.age} disabled={!!petForm.dateOfBirth} onChange={handlePetChange} className="custom-input" />
            </div>
          </div>
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
                Kennel {k.kennelId} ({statusMap[k.occupationStatus]})
              </option>
            ))}
          </select>

          <label className="input-label">Breed</label>
          <input name="breed" placeholder="Breed info" value={petForm.breed} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Behavioral Notes</label>
          <textarea name="behavioralNotes" placeholder="Behavior notes" value={petForm.behavioralNotes} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Date of Admittance</label>
          <input type="date" name="dateOfAdmittance" value={petForm.dateOfAdmittance} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Special Notes</label>
          <textarea name="specialNotes" placeholder="Special Notes" value={petForm.specialNotes} onChange={handlePetChange} className="custom-input" />

          <label className="input-label">Status</label>
          <select name="status" value={petForm.status} onChange={handlePetChange} className="custom-input">
            <option value="Available">Available</option>
            <option value="Adopted">Adopted</option>
            <option value="Fostered">Fostered</option>
          </select>

          <label className="input-label">Pet Image</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }} className="custom-input" />

          {(previewUrl || petForm.petId) && (
            <img
              src={
                previewUrl
                  ? previewUrl
                  : `http://localhost:5000/uploads/pet-${petForm.petId}.jpg?v=${imageVersion}`
              }
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
          <div className="table-container">
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
                    className={
                      selectedPetId == pet.petId ? "selected-row" : ""
                    }
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
      </div>
    </div >
  );
}

