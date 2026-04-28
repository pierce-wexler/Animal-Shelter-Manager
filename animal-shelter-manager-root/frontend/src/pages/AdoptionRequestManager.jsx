import { useState, useEffect } from "react";
import "./Manager.css";

export default function AdoptionRequestManager() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // 🔹 NEW: per-row date inputs
  const [dateInputs, setDateInputs] = useState({});

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

      if (res.ok) {
        const cleaned = data.map((r) => ({
          ...r,
          submitterName: r.submitterName || "—",
          petName: r.petName || "—",
          petBreed: r.petBreed || "Unknown",
          staffName: r.staffName || "—",
          qualificationNotes: r.qualificationNotes || "—",
        }));

        const sorted = cleaned.sort((a, b) => {
          const aPending = a.status?.toLowerCase() === "pending";
          const bPending = b.status?.toLowerCase() === "pending";

          // Pending first
          if (aPending !== bPending) {
            return bPending - aPending;
          }

          // Then newest first
          return b.requestId - a.requestId;
        });

        setRequests(sorted);

        // initialize date inputs for each row
        const initial = {};
        cleaned.forEach((r) => {
          initial[r.requestId] = {
            startDate: "",
            endDate: "",
          };
        });
        setDateInputs(initial);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================
  // HANDLE DATE CHANGE
  // =====================================
  const handleDateChange = (requestId, field, value) => {
    setDateInputs((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }));
  };

  // =====================================
  // APPROVE
  // =====================================
  const handleApprove = async (req) => {
    const dates = dateInputs[req.requestId];

    const res = await fetch(
      `/api/adoption-requests/${req.requestId}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: dates.startDate,
          endDate: dates.endDate || null,
        }),
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

  // =====================================
  // VALIDATION
  // =====================================
  const isApproveEnabled = (req) => {
    const dates = dateInputs[req.requestId];
    if (!dates || !dates.startDate) return false;

    if (req.adoptionType === "foster" && !dates.endDate) return false;

    return true;
  };

  return (
    <div className="manager-card">
      <h2 className="manager-title">
        Adoption Request Moderation
      </h2>

      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Adoption Requests</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Submitter</th>
                <th>Notes</th>
                <th>Pet</th>
                <th>Type</th>
                <th>Request Description</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Staff</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => {
                const dates = dateInputs[req.requestId] || {};

                return (
                  <tr
                    key={req.requestId}
                    style={{
                      background: req.blacklistFlag ? "#fee2e2" : "",
                    }}
                  >
                    {/* ID */}
                    <td>{req.requestId}</td>

                    {/* SUBMITTER */}
                    <td>
                      <div>
                        <div>{req.submitterName || "—"}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          ID: {req.submitterId}
                        </div>
                        <div
                          style={{
                            color: req.blacklistFlag ? "red" : "green",
                            fontWeight: 600,
                          }}
                        >
                          {req.blacklistFlag ? "Blacklisted" : "Clear"}
                        </div>
                      </div>
                    </td>

                    {/* NOTES */}
                    <td>
                      <div
                        style={{
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={req.qualificationNotes}
                      >
                        {req.qualificationNotes || "—"}
                      </div>
                    </td>

                    {/* PET */}
                    <td>
                      <div>
                        <div>{req.petName || "—"}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          ID: {req.petId}
                        </div>
                        <div>{req.petBreed || "Unknown"}</div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>{req.adoptionType}</td>

                    {/* DESCRIPTION */}
                    <td>
                      <div style={{ maxWidth: "250px", whiteSpace: "normal" }}>
                        {req.description || "—"}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>{req.status}</td>

                    {/* DATES */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <input
                          type="date"
                          value={dates.startDate || ""}
                          onChange={(e) =>
                            handleDateChange(
                              req.requestId,
                              "startDate",
                              e.target.value
                            )
                          }
                        />

                        {req.adoptionType === "foster" && (
                          <input
                            type="date"
                            value={dates.endDate || ""}
                            onChange={(e) =>
                              handleDateChange(
                                req.requestId,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    </td>

                    {/* STAFF */}
                    <td>
                      <div>
                        <div>{req.staffName || "—"}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          ID: {req.fufilledBy || "—"}
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      {req.status === "pending" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn btn-update"
                            onClick={() => handleApprove(req)}
                            disabled={
                              req.blacklistFlag === 1 ||
                              !isApproveEnabled(req)
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}