
import { useEffect, useState } from "react";

export default function PetCards() {
    const [pets, setPets] = useState([]);
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

    return (
        <div className="card-grid">
            {pets.map((pet) => (
                <div className="pet-card" key={pet.petId}>

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

                    {/* INFO */}
                    <h3>{pet.name}</h3>

                    <p><b>Breed:</b> {pet.breed || "Unknown"}</p>
                    <p><b>Age:</b> {pet.age ?? "—"}</p>
                    <p><b>Status:</b> {pet.status}</p>

                    {/* OPTIONAL */}
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {pet.behavioralNotes || ""}
                    </p>

                </div>
            ))}
        </div>
    );
}
