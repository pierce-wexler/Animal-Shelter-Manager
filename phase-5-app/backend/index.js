// File created/updated with help from chatgpt, as well as canvas video resources
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.get("/api/app_users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM app_user");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to" });
  }
});

/**
 * CREATE USER
 */
app.post("/api/users", async (req, res) => {
  const { userId, firstName, lastName, email, passwordHash } = req.body;

  try {
    await pool.query(
      "INSERT INTO app_user (userId, fname, lname, email, passwordHash) VALUES (?, ?, ?, ?, ?)",
      [userId, firstName, lastName, email, passwordHash]
    );

    res.json({ message: "User created" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "User with this ID already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create user",
      details: err.message,
    });
  }
});

/**
 * UPDATE USER
 */
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, passwordHash } = req.body;

  try {
    // Build dynamic fields
    const fields = [];
    const values = [];

    if (firstName) {
      fields.push("fname = ?");
      values.push(firstName);
    }

    if (lastName) {
      fields.push("lname = ?");
      values.push(lastName);
    }

    if (email) {
      fields.push("email = ?");
      values.push(email);
    }

    if (passwordHash) {
      fields.push("passwordHash = ?");
      values.push(passwordHash);
    }

    // If nothing to update
    if (fields.length === 0) {
      return res.status(400).json({
        error: "No fields provided to update",
      });
    }

    // Add ID for WHERE clause
    values.push(id);

    const query = `
      UPDATE app_user
      SET ${fields.join(", ")}
      WHERE userId = ?
    `;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found (cannot update)",
      });
    }

    res.json({ message: "User updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update user",
      details: err.message,
    });
  }
});


/**
 * DELETE USER
 */
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM app_user WHERE userId = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found (cannot delete)",
      });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to delete user",
      details: err.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});