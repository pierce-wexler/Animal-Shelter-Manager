import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Manager.css";

export default function AdoptionForm() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [pet, setPet] = useState(null);
  const [form, setForm] = useState({
    description: "",
    adoptionType: "permanent",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =========================
  // LOAD PET
  // =========================
  useEffect(() => {
    fetch(`/api/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPet)
      .catch(console.error);
  }, [petId]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    const res = await fetch("/api/adoption-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        petId,
        description: form.description,
        adoptionType: form.adoptionType,
      }),
    });

    const data = await res.json();

    setIsError(!res.ok);
    setMessage(data.message || data.error);

    if (res.ok) {
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  if (!pet) return <div>Loading...</div>;

  return (
    <div className="manager-card">
      <h2 className="manager-title">Adopt {pet.name}</h2>

      {/* MESSAGE */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* PET SUMMARY */}
      <div style={{ marginBottom: "20px" }}>
        <p><b>Breed:</b> {pet.breed}</p>
        <p><b>Status:</b> {pet.status}</p>
      </div>

      {/* FORM */}
      <div className="form-container">

        <label className="input-label">Adoption Type</label>
        <select
          name="adoptionType"
          value={form.adoptionType}
          onChange={handleChange}
          className="custom-input"
        >
          <option value="permanent">Permanent</option>
          <option value="foster">Foster</option>
        </select>

        <label className="input-label">Why do you want to adopt?</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="custom-input"
          rows={4}
        />

      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button
          className="btn btn-create"
          onClick={handleSubmit}
          disabled={!form.description}
        >
          Confirm Request
        </button>

        <button
          className="btn btn-delete"
          onClick={() => navigate(-1)} // 👈 GO BACK
        >
          Go Back
        </button>
      </div>
    </div>
  );
}