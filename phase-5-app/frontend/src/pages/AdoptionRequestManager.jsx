import { useState } from "react";

export default function AdoptionRequestManager() {
  const [form, setForm] = useState({
    requestId: "",
    submitterId: "",
    petId: "",
    description: "",
    status: "",
    fufilledBy: "",
    adoptionType: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/adoption-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Request created");
    } catch {
      setMessage("Error creating request");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/adoption-requests/${form.requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Request updated");
    } catch {
      setMessage("Error updating request");
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/adoption-requests/${form.requestId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Request deleted");
    } catch {
      setMessage("Error deleting request");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Adoption Request Manager</h2>

      <input name="requestId" placeholder="Request ID" value={form.requestId} onChange={handleChange} style={styles.input} />

      <input name="submitterId" placeholder="Submitted User ID" value={form.submitterId} onChange={handleChange} style={styles.input} />

      <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} style={styles.input} />

      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={styles.input} />

      <input name="status" placeholder="Status" value={form.status} onChange={handleChange} style={styles.input} />

      <input name="fulfilledBy" placeholder="Fulfilled By (staff ID, optional)" value={form.fulfilledBy} onChange={handleChange} style={styles.input} />

      <input name="adoptionType" placeholder="Adoption Type" value={form.adoptionType} onChange={handleChange} style={styles.input} />

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleCreate}>Create</button>
        <button style={styles.button} onClick={handleUpdate}>Update</button>
        <button style={styles.button} onClick={handleDelete}>Delete</button>
      </div>

      <p>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
    margin: "20px",
  },
  input: {
    padding: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "8px",
  },
};