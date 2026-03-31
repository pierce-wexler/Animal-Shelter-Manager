import { useState } from "react";

export default function PetManager() {
  const [form, setForm] = useState({
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

  const [petMessage, setPetMessage] = useState("");
  const [kennelMessage, setKennelMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setPetMessage(data.error);
        return;
      }

      setPetMessage("Pet created");
    } catch {
      setPetMessage("Error creating pet");
    }
  };

  // UPDATE (partial handled by backend)
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/pets/${form.petId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setPetMessage(data.error);
        return;
      }

      setPetMessage("Pet updated");
    } catch {
      setPetMessage("Error updating pet");
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/pets/${form.petId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setPetMessage(data.error);
        return;
      }

      setPetMessage("Pet deleted");
    } catch {
      setPetMessage("Error deleting pet");
    }
  };

  const [kennelForm, setKennelForm] = useState({
  kennelId: "",
  roomNo: "",
  occupationStatus: "",
  });

  const handleKennelChange = (e) => {
    setKennelForm({
      ...kennelForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleKennelCreate = async () => {
    try {
      const res = await fetch("/api/kennels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kennelForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setKennelMessage(data.error);
        return;
      }

      setKennelMessage("Kennel created");
    } catch {
      setKennelMessage("Error creating kennel");
    }
  };

  const handleKennelUpdate = async () => {
    try {
      const res = await fetch(`/api/kennels/${kennelForm.kennelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kennelForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setKennelMessage(data.error);
        return;
      }

      setKennelMessage("Kennel updated");
    } catch {
      setKennelMessage("Error updating kennel");
    }
  };

  const handleKennelDelete = async () => {
    try {
      const res = await fetch(`/api/kennels/${kennelForm.kennelId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setKennelMessage(data.error);
        return;
      }

      setKennelMessage("Kennel deleted");
    } catch {
      setKennelMessage("Error deleting kennel");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Pet Manager</h2>

      <input name="petId" placeholder="Pet ID" value={form.petId} onChange={handleChange} style={styles.input} />

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={styles.input} />

      <input name="dateOfBirth" placeholder="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChange={handleChange} style={styles.input} />

      <input name="sex" placeholder="Sex" value={form.sex} onChange={handleChange} style={styles.input} />

      <input name="kennelId" placeholder="Kennel ID" value={form.kennelId} onChange={handleChange} style={styles.input} />

      <input name="breed" placeholder="Breed" value={form.breed} onChange={handleChange} style={styles.input} />

      <input name="behavioralNotes" placeholder="Behavioral Notes" value={form.behavioralNotes} onChange={handleChange} style={styles.input} />

      <input name="dateOfAdmittance" placeholder="Date of Admittance (YYYY-MM-DD)" value={form.dateOfAdmittance} onChange={handleChange} style={styles.input} />

      <input name="specialNotes" placeholder="Special Notes" value={form.specialNotes} onChange={handleChange} style={styles.input} />

      <input name="status" placeholder="Status" value={form.status} onChange={handleChange} style={styles.input} />

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleCreate}>Create</button>
        <button style={styles.button} onClick={handleUpdate}>Update</button>
        <button style={styles.button} onClick={handleDelete}>Delete</button>
      </div>

      <p>{petMessage}</p>
      <hr />
      <h2>Kennel Manager</h2>

      <input
        name="kennelId"
        placeholder="Kennel ID"
        value={kennelForm.kennelId}
        onChange={handleKennelChange}
        style={styles.input}
      />

      <input
        name="roomNo"
        placeholder="Room Number"
        value={kennelForm.roomNo}
        onChange={handleKennelChange}
        style={styles.input}
      />

      <input
        name="occupationStatus"
        placeholder="Occupation Status"
        value={kennelForm.occupationStatus}
        onChange={handleKennelChange}
        style={styles.input}
      />

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleKennelCreate}>
          Create
        </button>
        <button style={styles.button} onClick={handleKennelUpdate}>
          Update
        </button>
        <button style={styles.button} onClick={handleKennelDelete}>
          Delete
        </button>
      </div>
      <p>{kennelMessage}</p>
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