// Created file from chatgpt
import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    passwordHash: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async () => {
  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to create user");
      return;
    }

    setMessage(data.message || "User created!");
  } catch (err) {
    setMessage("Network or server error");
  }
};

  const handleUpdate = async () => {
  try {
    const res = await fetch(`/api/users/${form.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to update user");
      return;
    }

    setMessage(data.message || "User updated!");
  } catch (err) {
    setMessage("Network or server error");
  }
};

  const handleDelete = async () => {
  try {
    const res = await fetch(`/api/users/${form.userId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to delete user");
      return;
    }

    setMessage(data.message || "User deleted!");
  } catch (err) {
    setMessage("Network or server error");
  }
};

  return (
    <div style={styles.container}>
      <h2>User Manager</h2>

      <input
        name="userId"
        placeholder="User ID"
        value={form.userId}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="firstName"
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="lastName"
        placeholder="Last Name"
        value={form.lastName}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="passwordHash"
        placeholder="Password Hash"
        value={form.passwordHash}
        onChange={handleChange}
        style={styles.input}
      />

      <div style={styles.buttonGroup}>
        <button onClick={handleCreate}>Create</button>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontFamily: "Arial",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
};