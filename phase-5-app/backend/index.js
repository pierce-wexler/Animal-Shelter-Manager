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

// CREATE ADOPTER
app.post("/api/adopters", async (req, res) => {
  const { userId, qualificationNotes, blacklistFlag } = req.body;

  try {
    await pool.query(
      "INSERT INTO adopter (userId, qualificationNotes, blacklistFlag) VALUES (?, ?, ?)",
      [userId, qualificationNotes, blacklistFlag]
    );

    res.json({ message: "Adopter created" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Adopter already exists" });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "User ID does not exist" });
    }

    res.status(500).json({ error: "Failed to create adopter" });
  }
});


// UPDATE ADOPTER (partial)
app.put("/api/adopters/:id", async (req, res) => {
  const { id } = req.params;
  const { qualificationNotes, blacklistFlag } = req.body;

  try {
    const fields = [];
    const values = [];

    if (qualificationNotes && qualificationNotes.trim() !== "") {
      fields.push("qualificationNotes = ?");
      values.push(qualificationNotes);
    }

    if (blacklistFlag !== undefined && blacklistFlag !== "") {
      fields.push("blacklistFlag = ?");
      values.push(blacklistFlag);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE adopter SET ${fields.join(", ")} WHERE userId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Adopter not found" });
    }

    res.json({ message: "Adopter updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update adopter" });
  }
});


// DELETE ADOPTER
app.delete("/api/adopters/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM adopter WHERE userId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Adopter not found" });
    }

    res.json({ message: "Adopter deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete adopter" });
  }
});

// CREATE STAFF
app.post("/api/staff", async (req, res) => {
  const { userId, supervisor } = req.body;

  try {
    await pool.query(
      "INSERT INTO staff (userId, supervisor) VALUES (?, ?)",
      [userId, supervisor]
    );

    res.json({ message: "Staff created" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Staff already exists" });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid userId or supervisor" });
    }

    res.status(500).json({ error: "Failed to create staff" });
  }
});


// UPDATE STAFF (partial)
app.put("/api/staff/:id", async (req, res) => {
  const { supervisor } = req.body;

  try {
    if (!supervisor) {
      return res.status(400).json({ error: "Supervisor required" });
    }

    const [result] = await pool.query(
      "UPDATE staff SET supervisor=? WHERE userId=?",
      [supervisor, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({ message: "Staff updated" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Supervisor does not exist" });
    }

    res.status(500).json({ error: "Failed to update staff" });
  }
});


// DELETE STAFF
app.delete("/api/staff/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM staff WHERE userId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({ message: "Staff deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete staff" });
  }
});

// CREATE VOLUNTEER
app.post("/api/volunteers", async (req, res) => {
  const { userId, supervisor } = req.body;

  try {
    await pool.query(
      "INSERT INTO volunteer (userId, supervisor) VALUES (?, ?)",
      [userId, supervisor]
    );

    res.json({ message: "Volunteer created" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Volunteer already exists" });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid userId or supervisor" });
    }

    res.status(500).json({ error: "Failed to create volunteer" });
  }
});


// UPDATE VOLUNTEER
app.put("/api/volunteers/:id", async (req, res) => {
  const { supervisor } = req.body;

  try {
    if (!supervisor) {
      return res.status(400).json({ error: "Supervisor required" });
    }

    const [result] = await pool.query(
      "UPDATE volunteer SET supervisor=? WHERE userId=?",
      [supervisor, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    res.json({ message: "Volunteer updated" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Supervisor does not exist" });
    }

    res.status(500).json({ error: "Failed to update volunteer" });
  }
});


// DELETE VOLUNTEER
app.delete("/api/volunteers/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM volunteer WHERE userId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    res.json({ message: "Volunteer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete volunteer" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});