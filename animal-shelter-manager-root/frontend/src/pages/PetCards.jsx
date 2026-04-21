import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function PetCards() {
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("/api/pets", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then(setPets)
            .catch(console.error);
    }, []);

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString() : "—";

    return (
        <>
            {/* ========================= */}
            {/* GRID */}
            {/* ========================= */}
            <div className="card-grid">
                {pets.map((pet) => (
                    <div
                        className="pet-card"
                        key={pet.petId}
                        onClick={() => setSelectedPet(pet)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* IMAGE */}
                        <div className="pet-image-container">
                            <img
                                src={`${BASE_URL}/uploads/pet-${pet.petId}.jpg`}
                                alt={pet.name}
                                className="pet-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.jpg";
                                }}
                            />
                        </div>

                        {/* BASIC INFO */}
                        <h3>{pet.name}</h3>
                        <p><b>Breed:</b> {pet.breed || "Unknown"}</p>
                        <p><b>Status:</b> {pet.status}</p>
                    </div>
                ))}
            </div>

            {/* ========================= */}
            {/* MODAL */}
            {/* ========================= */}
            {selectedPet && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setSelectedPet(null)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "12px",
                            width: "500px",
                            maxWidth: "90%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* IMAGE */}
                        <img
                            src={`${BASE_URL}/uploads/pet-${selectedPet.petId}.jpg`}
                            alt={selectedPet.name}
                            style={{
                                width: "100%",
                                borderRadius: "8px",
                                marginBottom: "10px",
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.jpg";
                            }}
                        />

                        <h2>{selectedPet.name}</h2>

                        {/* ========================= */}
                        {/* BASIC INFO */}
                        {/* ========================= */}
                        <h3>Basic Info</h3>
                        <p><b>Pet ID:</b> {selectedPet.petId}</p>
                        <p><b>Breed:</b> {selectedPet.breed || "Unknown"}</p>
                        <p><b>Sex:</b> {selectedPet.sex || "—"}</p>
                        <p><b>Age:</b> {selectedPet.age ?? "—"}</p>
                        <p><b>Date of Birth:</b> {formatDate(selectedPet.dateOfBirth)}</p>

                        {/* ========================= */}
                        {/* SHELTER INFO */}
                        {/* ========================= */}
                        <h3>Shelter Info</h3>
                        <p><b>Status:</b> {selectedPet.status}</p>
                        <p><b>Kennel ID:</b> {selectedPet.kennelId || "—"}</p>
                        <p><b>Date of Admittance:</b> {formatDate(selectedPet.dateOfAdmittance)}</p>
                        <p><b>Days in Shelter:</b> {selectedPet.daysInShelter ?? "—"}</p>

                        {/* ========================= */}
                        {/* NOTES */}
                        {/* ========================= */}
                        <h3>Notes</h3>
                        <p><b>Behavioral Notes:</b> {selectedPet.behavioralNotes || "None"}</p>
                        <p><b>Special Notes:</b> {selectedPet.specialNotes || "None"}</p>

                        {/* ========================= */}
                        {/* ACTIONS */}
                        {/* ========================= */}
                        <button
                            style={{
                                marginTop: "12px",
                                width: "100%",
                                padding: "10px",
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                            disabled={selectedPet.status?.toLowerCase() !== "available"} onClick={() => {
                                console.log("NAVIGATING TO:", `/adopt/${selectedPet.petId}`);
                                const id = selectedPet.petId;
                                setSelectedPet(null);
                                navigate(`/adopt/${id}`);
                            }}
                        >
                            {selectedPet.status?.toLowerCase() === "available"
                                ? "Request Adoption"
                                : "Not Available"}
                        </button>

                        {/* CLOSE */}
                        <button
                            style={{
                                marginTop: "8px",
                                width: "100%",
                                padding: "8px",
                                background: "#e5e7eb",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                            onClick={() => setSelectedPet(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}