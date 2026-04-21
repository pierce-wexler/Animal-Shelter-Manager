import { useState, useEffect } from "react";
import "./Manager.css";

export default function AdoptionRequestManager() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =====================================
  // LOAD REQUESTS
  // =====================================
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/adoption-requests/full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("REQUESTS:", data); // 🔍 debug

      if (res.ok) {
        const cleaned = data.map((r) => ({
          ...r,
          submitterName: r.submitterName || "—",
          petName: r.petName || "—",
          petBreed: r.petBreed || "Unknown",
          staffName: r.staffName || "—",
          qualificationNotes: r.qualificationNotes || "—",
        }));

        setRequests(cleaned);
      } else {
        console.error("Fetch failed:", data);
      }

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================
  // APPROVE
  // =====================================
  const handleApprove = async (req) => {
    const res = await fetch(
      `/api/adoption-requests/${req.requestId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setIsError(!res.ok);
    setMessage(data.message || data.error);

    if (res.ok) fetchRequests();
  };

  // =====================================
  // DENY
  // =====================================
  const handleDeny = async (req) => {
    const res = await fetch(
      `/api/adoption-requests/${req.requestId}/deny`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setIsError(!res.ok);
    setMessage(data.message || data.error);

    if (res.ok) fetchRequests();
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">
        Adoption Request Moderation
      </h2>

      {/* STATUS MESSAGE */}
      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* TABLE */}
      <div style={{ marginTop: "20px" }}>
        <h3>Adoption Requests</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>

                <th>Submitter ID</th>
                <th>Submitter Name</th>

                <th>Blacklisted</th>
                <th>Adopter Notes</th>

                <th>Pet ID</th>
                <th>Pet Name</th>
                <th>Breed</th>

                <th>Type</th>
                <th>Status</th>

                <th>Staff ID</th>
                <th>Staff Name</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.requestId}
                  style={{
                    background: req.blacklistFlag ? "#fee2e2" : ""
                  }}
                >
                  <td>{req.requestId}</td>

                  {/* SUBMITTER */}
                  <td>{req.submitterId || "—"}</td>
                  <td>{req.submitterName || "—"}</td>

                  {/* BLACKLIST */}
                  <td
                    style={{
                      color: req.blacklistFlag ? "red" : "green",
                      fontWeight: 600
                    }}
                  >
                    {req.blacklistFlag ? "Yes" : "No"}
                  </td>

                  {/* NOTES */}
                  <td>{req.qualificationNotes || "—"}</td>

                  {/* PET */}
                  <td>{req.petId || "—"}</td>
                  <td>{req.petName || "—"}</td>
                  <td>{req.petBreed || "Unknown"}</td>

                  <td>{req.adoptionType}</td>
                  <td>{req.status}</td>

                  {/* STAFF */}
                  <td>{req.fufilledBy || "—"}</td>
                  <td>{req.staffName || "—"}</td>

                  {/* ACTIONS */}
                  <td>
                    {req.status === "pending" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-update"
                          onClick={() => handleApprove(req)}
                          disabled={req.blacklistFlag === 1}
                          title={
                            req.blacklistFlag
                              ? "Cannot approve blacklisted adopter"
                              : ""
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-delete"
                          onClick={() => handleDeny(req)}
                        >
                          Deny
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#6b7280" }}>—</span>
                    )}
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