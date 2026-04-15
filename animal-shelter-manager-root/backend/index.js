// File created/updated with help from chatgpt, as well as canvas video resources
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";

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
// mount routes
app.use("/api", authRoutes(pool));

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

// GET ALL PETS
app.get("/api/pets", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pet");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pets" });
  }
});

// GET ALL RECORDS (Joined with specific types)
app.get("/api/records", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, m.institution, m.vet, f.fosterParentId, f.startDate, f.endDate, a.adopterId, a.adoptionDate, a.feePaid
      FROM record r
      LEFT JOIN medical_record m ON r.recordId = m.recordId
      LEFT JOIN foster_record f ON r.recordId = f.recordId
      LEFT JOIN adoption_record a ON r.recordId = a.recordId
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// GET ALL EVENTS
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM event");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
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

// =======================
// MEDICAL RECORDS
// =======================

app.post("/api/medical-records", async (req, res) => {
  const { recordId, petId, dateOfRecord, recordType, notes, institution, vet } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO record (recordId, petId, dateOfRecord, recordType, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [recordId, petId, dateOfRecord, recordType, notes]
    );

    await conn.query(
      `INSERT INTO medical_record (recordId, institution, vet)
       VALUES (?, ?, ?)`,
      [recordId, institution, vet]
    );

    await conn.commit();
    res.json({ message: "Medical record created" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create medical record" });
  } finally {
    conn.release();
  }
});

app.put("/api/medical-records/:id", async (req, res) => {
  const { id } = req.params;
  const { petId, dateOfRecord, notes, institution, vet } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?`,
      [petId, dateOfRecord, notes, id]
    );

    await conn.query(
      `UPDATE medical_record SET institution=?, vet=? WHERE recordId=?`,
      [institution, vet, id]
    );

    await conn.commit();
    res.json({ message: "Medical record updated" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update medical record" });
  } finally {
    conn.release();
  }
});


// =======================
// ADOPTION RECORDS
// =======================

app.post("/api/adoption-records", async (req, res) => {
  const { recordId, petId, dateOfRecord, recordType, notes, adopterId, staffId } = req.body;
  const conn = await pool.getConnection();

  const cleanAdopterId = adopterId === "" ? null : adopterId;
  const cleanStaffId = staffId === "" ? null : staffId;

  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO record (recordId, petId, dateOfRecord, recordType, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [recordId, petId, dateOfRecord, recordType, notes]
    );

    await conn.query(
      `INSERT INTO adoption_record (recordId, adopterId, staffId)
       VALUES (?, ?, ?)`,
      [recordId, cleanAdopterId, cleanStaffId]
    );

    await conn.commit();
    res.json({ message: "Adoption record created" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create adoption record" });
  } finally {
    conn.release();
  }
});

app.put("/api/adoption-records/:id", async (req, res) => {
  const { id } = req.params;
  const { petId, dateOfRecord, notes, adopterId, staffId } = req.body;
  const conn = await pool.getConnection();

  const cleanAdopterId = adopterId === "" ? null : adopterId;
  const cleanStaffId = staffId === "" ? null : staffId;

  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?`,
      [petId, dateOfRecord, notes, id]
    );

    await conn.query(
      `UPDATE adoption_record SET adopterId=?, staffId=? WHERE recordId=?`,
      [cleanAdopterId, cleanStaffId, id]
    );

    await conn.commit();
    res.json({ message: "Adoption record updated" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update adoption record" });
  } finally {
    conn.release();
  }
});


// =======================
// FOSTER RECORDS (inherits adoption)
// =======================

app.post("/api/foster-records", async (req, res) => {
  const {
    recordId,
    petId,
    dateOfRecord,
    recordType,
    notes,
    adopterId,
    staffId,
    status,
    fosterEndDate,
  } = req.body;

  const conn = await pool.getConnection();

  const cleanAdopterId = adopterId === "" ? null : adopterId;
  const cleanStaffId = staffId === "" ? null : staffId;

  try {
    await conn.beginTransaction();

    // base
    await conn.query(
      `INSERT INTO record (recordId, petId, dateOfRecord, recordType, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [recordId, petId, dateOfRecord, recordType, notes]
    );

    // adoption layer
    await conn.query(
      `INSERT INTO adoption_record (recordId, adopterId, staffId)
       VALUES (?, ?, ?)`,
      [recordId, cleanAdopterId, cleanStaffId]
    );

    // foster layer
    await conn.query(
      `INSERT INTO foster_record (recordId, status, fosterEndDate)
       VALUES (?, ?, ?)`,
      [recordId, status, fosterEndDate]
    );

    await conn.commit();
    res.json({ message: "Foster record created" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create foster record" });
  } finally {
    conn.release();
  }
});

app.put("/api/foster-records/:id", async (req, res) => {
  const { id } = req.params;

  const {
    petId,
    dateOfRecord,
    notes,
    adopterId,
    staffId,
    status,
    fosterEndDate,
  } = req.body;

  const conn = await pool.getConnection();

  const cleanAdopterId = adopterId === "" ? null : adopterId;
  const cleanStaffId = staffId === "" ? null : staffId;

  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?`,
      [petId, dateOfRecord, notes, id]
    );

    await conn.query(
      `UPDATE adoption_record SET adopterId=?, staffId=? WHERE recordId=?`,
      [cleanAdopterId, cleanStaffId, id]
    );

    await conn.query(
      `UPDATE foster_record SET status=?, fosterEndDate=? WHERE recordId=?`,
      [status, fosterEndDate, id]
    );

    await conn.commit();
    res.json({ message: "Foster record updated" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update foster record" });
  } finally {
    conn.release();
  }
});


// =======================
// DELETE (NO CASCADE SAFE)
// =======================

app.delete("/api/records/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT recordType FROM record WHERE recordId = ?",
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Record not found" });
    }

    const type = rows[0].recordType;

    if (type === "foster") {
      await conn.query("DELETE FROM foster_record WHERE recordId = ?", [id]);
      await conn.query("DELETE FROM adoption_record WHERE recordId = ?", [id]);

    } else if (type === "adoption") {
      await conn.query("DELETE FROM adoption_record WHERE recordId = ?", [id]);

    } else if (type === "medical") {
      await conn.query("DELETE FROM medical_record WHERE recordId = ?", [id]);
    }

    await conn.query("DELETE FROM record WHERE recordId = ?", [id]);

    await conn.commit();
    res.json({ message: "Record deleted" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to delete record" });
  } finally {
    conn.release();
  }
});

app.put("/api/pets/:id", async (req, res) => {
  const { id } = req.params;

  const {
    name,
    dateOfBirth,
    age,
    sex,
    kennelId,
    breed,
    behavioralNotes,
    dateOfAdmittance,
    daysInShelter,
    specialNotes,
    status,
  } = req.body;

  try {
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (dateOfBirth) {
      fields.push("dateOfBirth = ?");
      values.push(dateOfBirth);

      fields.push("age = TIMESTAMPDIFF(YEAR, ?, CURDATE())");
      values.push(dateOfBirth);
    }

    if (age) {
      fields.push("age = ?");
      values.push(age);
    }

    if (sex) {
      fields.push("sex = ?");
      values.push(sex);
    }

    if (kennelId) {
      fields.push("kennelId = ?");
      values.push(kennelId);
    }

    if (breed) {
      fields.push("breed = ?");
      values.push(breed);
    }

    if (behavioralNotes) {
      fields.push("behavioralNotes = ?");
      values.push(behavioralNotes);
    }

    if (dateOfAdmittance) {
      fields.push("dateOfAdmittance = ?");
      values.push(dateOfAdmittance);

      fields.push("daysInShelter = DATEDIFF(CURDATE(), ?)");
      values.push(dateOfAdmittance);
    }

    if (specialNotes) {
      fields.push("specialNotes = ?");
      values.push(specialNotes);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE pet SET ${fields.join(", ")} WHERE petId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    res.json({ message: "Pet updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update pet" });
  }
});

app.delete("/api/pets/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pet WHERE petId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    res.json({ message: "Pet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete pet" });
  }
});

app.post("/api/kennels", async (req, res) => {
  const { kennelId, roomNo, occupationStatus } = req.body;

  try {
    await pool.query(
      "INSERT INTO kennel (kennelId, roomNo, occupationStatus) VALUES (?, ?, ?)",
      [kennelId, roomNo, occupationStatus]
    );

    res.json({ message: "Kennel created" });
  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Kennel with this ID already exists",
      });
    }

    res.status(500).json({ error: "Failed to create kennel" });
  }
});

app.put("/api/kennels/:id", async (req, res) => {
  const { id } = req.params;
  const { roomNo, occupationStatus } = req.body;

  try {
    const fields = [];
    const values = [];

    if (roomNo) {
      fields.push("roomNo = ?");
      values.push(roomNo);
    }

    if (occupationStatus) {
      fields.push("occupationStatus = ?");
      values.push(occupationStatus);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        error: "No fields provided",
      });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE kennel SET ${fields.join(", ")} WHERE kennelId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Kennel not found",
      });
    }

    res.json({ message: "Kennel updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update kennel" });
  }
});

app.delete("/api/kennels/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM kennel WHERE kennelId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Kennel not found",
      });
    }

    res.json({ message: "Kennel deleted" });
  } catch (err) {
    console.error(err);

    // FK constraint (e.g., kennel used by pet)
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "Cannot delete kennel (it is assigned to a pet)",
      });
    }

    res.status(500).json({ error: "Failed to delete kennel" });
  }
});

app.post("/api/events", async (req, res) => {
  const {
    eventId,
    eventType,
    eventDateTime,
    staffId,
    volunteerId,
    adopterId,
    petId,
    location,
  } = req.body;

  try {
    const formattedDate = eventDateTime
      ? eventDateTime.replace("T", " ") + ":00"
      : null;

    await pool.query(
      `INSERT INTO event 
      (eventId, eventType, eventDateTime, staffId, volunteerId, adopterId, petId, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        eventType,
        formattedDate,
        staffId,
        volunteerId || null,
        adopterId,
        petId,
        location,
      ]
    );

    res.json({ message: "Event created" });

  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Event with this ID already exists",
      });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid foreign key",
      });
    }

    res.status(500).json({ error: "Failed to create event" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;

  const {
    eventType,
    eventDateTime,
    staffId,
    volunteerId,
    adopterId,
    petId,
    location,
  } = req.body;

  try {
    const fields = [];
    const values = [];

    if (eventType) {
      fields.push("eventType = ?");
      values.push(eventType);
    }

    if (eventDateTime) {
      fields.push("eventDateTime = ?");
      values.push(eventDateTime.replace("T", " ") + ":00");
    }

    if (staffId) {
      fields.push("staffId = ?");
      values.push(staffId);
    }

    if (volunteerId !== undefined) {
      fields.push("volunteerId = ?");
      values.push(volunteerId || null);
    }

    if (adopterId) {
      fields.push("adopterId = ?");
      values.push(adopterId);
    }

    if (petId) {
      fields.push("petId = ?");
      values.push(petId);
    }

    if (location) {
      fields.push("location = ?");
      values.push(location);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE event SET ${fields.join(", ")} WHERE eventId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event updated" });

  } catch (err) {
    console.error(err);

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid foreign key",
      });
    }

    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM event WHERE eventId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    res.json({ message: "Event deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.post("/api/adoption-requests", async (req, res) => {
  const {
    requestId,
    submitterId,
    petId,
    description,
    status,
    fufilledBy,
    adoptionType,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO adoption_request
      (requestId, submitterId, petId, description, status, fufilledBy, adoptionType)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        submitterId,
        petId,
        description,
        status,
        fufilledBy || null,
        adoptionType,
      ]
    );

    res.json({ message: "Request created" });

  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Request with this ID already exists",
      });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid foreign key (user or pet)",
      });
    }

    res.status(500).json({ error: "Failed to create request" });
  }
});

app.put("/api/adoption-requests/:id", async (req, res) => {
  const { id } = req.params;

  const {
    submitterId,
    petId,
    description,
    status,
    fufilledBy,
    adoptionType,
  } = req.body;

  try {
    const fields = [];
    const values = [];

    if (submitterId) {
      fields.push("submitterId = ?");
      values.push(submitterId);
    }

    if (petId) {
      fields.push("petId = ?");
      values.push(petId);
    }

    if (description) {
      fields.push("description = ?");
      values.push(description);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fufilledBy !== undefined) {
      fields.push("fufilledBy = ?");
      values.push(fufilledBy || null);
    }

    if (adoptionType) {
      fields.push("adoptionType = ?");
      values.push(adoptionType);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE adoption_request SET ${fields.join(", ")} WHERE requestId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ message: "Request updated" });

  } catch (err) {
    console.error(err);

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid foreign key",
      });
    }

    res.status(500).json({ error: "Failed to update request" });
  }
});

app.delete("/api/adoption-requests/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM adoption_request WHERE requestId = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    res.json({ message: "Request deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete request" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});