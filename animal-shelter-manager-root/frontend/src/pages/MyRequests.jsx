import { useEffect, useState } from "react";
import "./Manager.css";

export default function MyRequests() {
    const token = localStorage.getItem("token");
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch("/api/adoption-requests/my", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then(setRequests)
            .catch(console.error);
    }, []);

    const formatStatus = (status) => {
        const s = status?.toLowerCase();

        if (s === "approved") return "Approved";
        if (s === "denied") return "Denied";
        return "Pending";
    };

    return (
        <div className="manager-card">
            <h2 className="manager-title">My Adoption Requests</h2>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Pet ID</th>
                            <th>Pet Name</th>
                            <th>Breed</th>
                            <th>Adoption Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            requests.map((r) => {
                                const petName = r.petName || r.name || "Unknown";
                                const petBreed = r.petBreed || r.breed || "Unknown";
                                const status = r.status?.toLowerCase() || "pending";

                                return (
                                    <tr key={r.requestId}>
                                        <td>{r.requestId}</td>

                                        {/* PET ID */}
                                        <td>{r.petId}</td>

                                        {/* PET NAME */}
                                        <td>{petName}</td>

                                        {/* BREED */}
                                        <td>{petBreed}</td>

                                        {/* TYPE */}
                                        <td style={{ textTransform: "capitalize" }}>
                                            {r.adoptionType}
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <span className={`status-badge ${status}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}