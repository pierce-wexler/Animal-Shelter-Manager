
import { useState, useEffect } from "react";
import "./Manager.css";

export default function PetManager() {
  const token = localStorage.getItem("token");

  // =====================================
  // PET FORM
  // =====================================
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

  // =====================================
  // KENNEL FORM
  // =====================================
  const [kennelForm, setKennelForm] = useState({
    kennelId: "",
    roomNo: "",
    occupationStatus: "0",
  });

  // =====================================
  // TABLE DATA
  // =====================================
  const [pets, setPets] = useState([]);
  const [kennels, setKennels] = useState([]);

  const [petMessage, setPetMessage] = useState("");
  const [petIsError, setPetIsError] = useState(false);

  const [kennelMessage, setKennelMessage] = useState("");
  const [kennelIsError, setKennelIsError] = useState(false);

  // =====================================
  // LOAD DATA
  // =====================================
  const fetchPets = async () => {
    try {
      const res = await fetch("/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) setPets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKennels = async () => {
    try {
      const res = await fetch("/api/kennels", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) setKennels(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPets();
    fetchKennels();
  }, []);

  // =====================================
  // HANDLERS
  // =====================================
  const handlePetChange = (e) => {
    setPetForm({
      ...petForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleKennelChange = (e) => {
    setKennelForm({
      ...kennelForm,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // PET ACTIONS
  // =====================================
  const handlePetAction = async (method) => {
    try {
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

      if (res.ok) fetchPets();

    } catch {
      setPetIsError(true);
      setPetMessage("Server error");
    }
  };

  // =====================================
  // KENNEL ACTIONS
  // =====================================
  const handleKennelAction = async (method) => {
    try {
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

      if (res.ok) fetchKennels();

    } catch {
      setKennelIsError(true);
      setKennelMessage("Server error");
    }
  };

  return (
    <div className="multi-manager-container">

      {/* PET SECTION */}
      <div className="manager-card">
        <h2 className="manager-title">Pet Management</h2>

        <div className="form-container">
          <input
            name="petId"
            placeholder="Pet ID (update/delete)"
            value={petForm.petId}
            onChange={handlePetChange}
            className="custom-input"
          />

          <div className="input-row">
            <input
              name="name"
              placeholder="Name"
              value={petForm.name}
              onChange={handlePetChange}
              className="custom-input"
            />

            <input
              name="breed"
              placeholder="Breed"
              value={petForm.breed}
              onChange={handlePetChange}
              className="custom-input"
            />
          </div>

          <div className="input-row">
            <input
              name="sex"
              placeholder="Sex"
              value={petForm.sex}
              onChange={handlePetChange}
              className="custom-input"
            />

            <input
              name="age"
              placeholder="Age"
              value={petForm.age}
              onChange={handlePetChange}
              className="custom-input"
            />
          </div>

          <input
            name="kennelId"
            placeholder="Kennel ID"
            value={petForm.kennelId}
            onChange={handlePetChange}
            className="custom-input"
          />

          <input
            name="status"
            placeholder="Status"
            value={petForm.status}
            onChange={handlePetChange}
            className="custom-input"
          />
        </div>

        <div className="button-group">
          <button
            onClick={() => handlePetAction("POST")}
            className="btn btn-create"
          >
            Create
          </button>

          <button
            onClick={() => handlePetAction("PUT")}
            className="btn btn-update"
          >
            Update
          </button>

          <button
            onClick={() => handlePetAction("DELETE")}
            className="btn btn-delete"
          >
            Delete
          </button>
        </div>

        {petMessage && (
          <div className={`status-message ${petIsError ? "error" : "success"}`}>
            {petMessage}
          </div>
        )}

        {/* PET TABLE */}
        <div style={{ marginTop: "25px" }}>
          <h3>Current Pets</h3>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Age</th>
                <th>Kennel</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pets.map((pet) => (
                <tr key={pet.petId}>
                  <td>{pet.petId}</td>
                  <td>{pet.name}</td>
                  <td>{pet.breed}</td>
                  <td>{pet.sex}</td>
                  <td>{pet.age}</td>
                  <td>{pet.kennelId}</td>
                  <td>{pet.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KENNEL SECTION */}
      <div className="manager-card">
        <h2 className="manager-title">Kennel Management</h2>

        <div className="form-container">
          <input
            name="kennelId"
            placeholder="Kennel ID (update/delete)"
            value={kennelForm.kennelId}
            onChange={handleKennelChange}
            className="custom-input"
          />

          <input
            name="roomNo"
            placeholder="Room Number"
            value={kennelForm.roomNo}
            onChange={handleKennelChange}
            className="custom-input"
          />

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
          <button
            onClick={() => handleKennelAction("POST")}
            className="btn btn-create"
          >
            Create
          </button>

          <button
            onClick={() => handleKennelAction("PUT")}
            className="btn btn-update"
          >
            Update
          </button>

          <button
            onClick={() => handleKennelAction("DELETE")}
            className="btn btn-delete"
          >
            Delete
          </button>
        </div>

        {kennelMessage && (
          <div className={`status-message ${kennelIsError ? "error" : "success"}`}>
            {kennelMessage}
          </div>
        )}

        {/* KENNEL TABLE */}
        <div style={{ marginTop: "25px" }}>
          <h3>Current Kennels</h3>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {kennels.map((kennel) => (
                <tr key={kennel.kennelId}>
                  <td>{kennel.kennelId}</td>
                  <td>{kennel.roomNo}</td>
                  <td>
                    {String(kennel.occupationStatus) === "1"
                      ? "Occupied"
                      : "Vacant"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
