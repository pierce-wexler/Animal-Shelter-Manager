import { useState, useEffect } from "react";
import "./Manager.css";

export default function RecordManager() {
  const token = localStorage.getItem("token");

  const [recordType, setRecordType] = useState("medical");
  const [pets, setPets] = useState([]);

  const emptyForm = {
    recordId: "",
    petId: "",
    dateOfRecord: "",
    notes: "",
    institution: "",
    vet: "",
    adopterId: "",
    staffId: "",
    status: "",
  };

  const [form, setForm] = useState(emptyForm);

  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records/full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    fetchRecords();
    fetchPets();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRowClick = (record) => {
    setSelectedRecordId(record.recordId);
    setRecordType(record.recordType);

    setForm({
      ...record,
      dateOfRecord: record.dateOfRecord?.split("T")[0] || "",
    });
  };

  const endpointMap = {
    medical: "/api/medical-records",
    adoption: "/api/adoption-records",
    foster: "/api/foster-records",
  };

  const resetForm = () => {
    setSelectedRecordId(null);
    setForm(emptyForm);
  };

  const handleAction = async (method) => {
    try {
      if (method === "DELETE") {
        if (!window.confirm("Delete this record?")) return;
      }

      let url = "";

      if (method === "DELETE" || method === "PUT") {
        url = `/api/records/${form.recordId}`;
      } else {
        url = endpointMap[recordType];
      }

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (method !== "DELETE") {
        options.body = JSON.stringify({
          ...form,
          recordType,
        });
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message || data.error);

      if (!res.ok) return;

      if (method === "DELETE") {
        resetForm();
        fetchRecords();
        return;
      }

      fetchRecords();

      if (method === "POST") {
        setTimeout(resetForm, 300);
      }

    } catch {
      setIsError(true);
      setMessage("Server error");
    }
  };

  const filteredRecords = records.filter(
    (r) => r.recordType === recordType
  );

  return (
    <div className="manager-card">
      <h2 className="manager-title">
        Pet Record Management
      </h2>

      {selectedRecordId && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px"
        }}>
          <span style={{ fontWeight: 600, color: "#2563eb" }}>
            Editing Record ID: {selectedRecordId}
          </span>

          <button
            className="btn-thin"
            style={{ background: "#6b7280" }}
            onClick={resetForm}
          >
            Stop Editing
          </button>
        </div>
      )}

      <div className="form-container">

        <label className="input-label">Record Type</label>
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="custom-input"
        >
          <option value="medical">Medical</option>
          <option value="adoption">Adoption</option>
          <option value="foster">Foster</option>
        </select>

        <div className="input-row">
          <div style={{ width: "100%" }}>
            <label className="input-label">Pet</label>
            <select
              name="petId"
              value={form.petId}
              onChange={handleChange}
              className="custom-input"
            >
              <option value="">Select Pet</option>
              {[...pets]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((pet) => (
                  <option key={pet.petId} value={pet.petId}>
                    #{pet.petId} – {pet.name} ({pet.breed || "Unknown"})
                    {pet.status ? ` - ${pet.status}` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ width: "100%" }}>
            <label className="input-label">Date of Record</label>
            <input
              type="date"
              name="dateOfRecord"
              value={form.dateOfRecord}
              onChange={handleChange}
              className="custom-input"
            />
          </div>
        </div>

        <label className="input-label">Notes</label>
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="custom-input"
          style={{ height: "70px" }}
        />

        {recordType === "medical" && (
          <>
            <label className="input-label">Institution</label>
            <input
              name="institution"
              placeholder="Institution"
              value={form.institution}
              onChange={handleChange}
              className="custom-input"
            />

            <label className="input-label">Veterinarian</label>
            <input
              name="vet"
              placeholder="Veterinarian"
              value={form.vet}
              onChange={handleChange}
              className="custom-input"
            />
          </>
        )}

        {recordType === "adoption" && (
          <div className="input-row">
            <div style={{ width: "100%" }}>
              <label className="input-label">Adopter ID</label>
              <input
                name="adopterId"
                placeholder="Adopter ID"
                value={form.adopterId}
                onChange={handleChange}
                className="custom-input"
              />
            </div>

            <div style={{ width: "100%" }}>
              <label className="input-label">Staff ID</label>
              <input
                name="staffId"
                placeholder="Staff ID"
                value={form.staffId}
                onChange={handleChange}
                className="custom-input"
              />
            </div>
          </div>
        )}

        {recordType === "foster" && (
          <>
            <div className="input-row">
              <div style={{ width: "100%" }}>
                <label className="input-label">Adopter ID</label>
                <input
                  name="adopterId"
                  placeholder="Adopter ID"
                  value={form.adopterId}
                  onChange={handleChange}
                  className="custom-input"
                />
              </div>

              <div style={{ width: "100%" }}>
                <label className="input-label">Staff ID</label>
                <input
                  name="staffId"
                  placeholder="Staff ID"
                  value={form.staffId}
                  onChange={handleChange}
                  className="custom-input"
                />
              </div>
            </div>

            <label className="input-label">Foster Status</label>
            <input
              name="status"
              placeholder="Foster Status"
              value={form.status}
              onChange={handleChange}
              className="custom-input"
            />
          </>
        )}
      </div>

      <div className="button-group">
        <button
          onClick={() => handleAction("POST")}
          className="btn btn-create"
          disabled={!!selectedRecordId}
        >
          Create
        </button>

        <button
          onClick={() => handleAction("PUT")}
          className="btn btn-update"
          disabled={!selectedRecordId}
        >
          Update
        </button>

        <button
          onClick={() => handleAction("DELETE")}
          className="btn btn-delete"
          disabled={!selectedRecordId}
        >
          Delete
        </button>
      </div>

      {message && (
        <div className={`status-message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Click row to edit</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pet ID</th>
                <th>Pet Name</th>
                <th>Breed</th>
                <th>Date</th>

                {recordType === "medical" && (
                  <>
                    <th>Institution</th>
                    <th>Vet</th>
                  </>
                )}

                {recordType === "adoption" && (
                  <>
                    <th>Adopter Id</th>
                    <th>Adopter Name</th>
                    <th>Staff Id</th>
                    <th>Staff Name</th>
                  </>
                )}

                {recordType === "foster" && (
                  <>
                    <th>Adopter Id</th>
                    <th>Adopter Name</th>
                    <th>Staff Id</th>
                    <th>Staff Name</th>
                    <th>Status</th>
                    <th>End Date</th>
                  </>
                )}

                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.recordId}
                  onClick={() => handleRowClick(record)}
                  className={
                    selectedRecordId == record.recordId
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{record.recordId}</td>

                  <td>{record.petId}</td>

                  <td>{record.petName || "Unknown"}</td>

                  <td>{record.petBreed || "Unknown"}</td>

                  <td>
                    {record.dateOfRecord
                      ? record.dateOfRecord.split("T")[0]
                      : "—"}
                  </td>

                  {/* MEDICAL */}
                  {recordType === "medical" && (
                    <>
                      <td>{record.institution || "—"}</td>
                      <td>{record.vet || "—"}</td>
                    </>
                  )}

                  {/* ADOPTION */}
                  {recordType === "adoption" && (
                    <>
                      <td>{record.adopterId || "—"}</td>
                      <td>{record.adopterName || "—"}</td>
                      <td>{record.staffId || "—"}</td>
                      <td>{record.staffName || "—"}</td>
                    </>
                  )}

                  {/* FOSTER */}
                  {recordType === "foster" && (
                    <>
                      <td>{record.adopterId || "—"}</td>
                      <td>{record.adopterName || "—"}</td>
                      <td>{record.staffId || "—"}</td>
                      <td>{record.staffName || "—"}</td>
                      <td>{record.fosterStatus || "—"}</td>
                      <td>
                        {record.fosterEndDate
                          ? record.fosterEndDate.split("T")[0]
                          : "—"}
                      </td>
                    </>
                  )}

                  <td>{record.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}