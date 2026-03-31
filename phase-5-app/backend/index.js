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

/**
 * CREATE MEDICAL RECORD
 */
app.post("/api/medical-records", async (req, res) => {
  const { petId, dateOfRecord, notes, institution, vet } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rec] = await connection.query(
      "INSERT INTO record (petId, dateOfRecord, recordType, notes) VALUES (?, ?, 'medical', ?)",
      [petId, dateOfRecord, notes]
    );
    await connection.query(
      "INSERT INTO medical_record (recordId, institution, vet) VALUES (?, ?, ?)",
      [rec.insertId, institution, vet]
    );
    await connection.commit();
    res.json({ message: "Medical record created", recordId: rec.insertId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * CREATE FOSTER RECORD
 */
app.post("/api/foster-records", async (req, res) => {
  const { petId, dateOfRecord, notes, fosterParentId, startDate, endDate } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rec] = await connection.query(
      "INSERT INTO record (petId, dateOfRecord, recordType, notes) VALUES (?, ?, 'foster', ?)",
      [petId, dateOfRecord, notes]
    );
    await connection.query(
      "INSERT INTO foster_record (recordId, fosterParentId, startDate, endDate) VALUES (?, ?, ?, ?)",
      [rec.insertId, fosterParentId, startDate, endDate]
    );
    await connection.commit();
    res.json({ message: "Foster record created" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * CREATE ADOPTION RECORD
 */
app.post("/api/adoption-records", async (req, res) => {
  const { petId, dateOfRecord, notes, adopterId, adoptionDate, feePaid } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rec] = await connection.query(
      "INSERT INTO record (petId, dateOfRecord, recordType, notes) VALUES (?, ?, 'adoption', ?)",
      [petId, dateOfRecord, notes]
    );
    await connection.query(
      "INSERT INTO adoption_record (recordId, adopterId, adoptionDate, feePaid) VALUES (?, ?, ?, ?)",
      [rec.insertId, adopterId, adoptionDate, feePaid]
    );
    await connection.commit();
    res.json({ message: "Adoption record created" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * UPDATE MEDICAL RECORD
 */
app.put("/api/medical-records/:id", async (req, res) => {
  const { id } = req.params; // This is the recordId
  const { petId, dateOfRecord, notes, institution, vet } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Update Superclass
    await connection.query(
      "UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?",
      [petId, dateOfRecord, notes, id]
    );
    // Update Subclass
    await connection.query(
      "UPDATE medical_record SET institution=?, vet=? WHERE recordId=?",
      [institution, vet, id]
    );
    await connection.commit();
    res.json({ message: "Medical record updated" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * UPDATE FOSTER RECORD
 */
app.put("/api/foster-records/:id", async (req, res) => {
  const { id } = req.params;
  const { petId, dateOfRecord, notes, fosterParentId, startDate, endDate } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?",
      [petId, dateOfRecord, notes, id]
    );
    await connection.query(
      "UPDATE foster_record SET fosterParentId=?, startDate=?, endDate=? WHERE recordId=?",
      [fosterParentId, startDate, endDate, id]
    );
    await connection.commit();
    res.json({ message: "Foster record updated" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * UPDATE ADOPTION RECORD
 */
app.put("/api/adoption-records/:id", async (req, res) => {
  const { id } = req.params;
  const { petId, dateOfRecord, notes, adopterId, adoptionDate, feePaid } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "UPDATE record SET petId=?, dateOfRecord=?, notes=? WHERE recordId=?",
      [petId, dateOfRecord, notes, id]
    );
    await connection.query(
      "UPDATE adoption_record SET adopterId=?, adoptionDate=?, feePaid=? WHERE recordId=?",
      [adopterId, adoptionDate, feePaid, id]
    );
    await connection.commit();
    res.json({ message: "Adoption record updated" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE ANY RECORD TYPE
 */
app.delete("/api/records/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM record WHERE recordId = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete record. Check if it is being referenced elsewhere." });
  }
});

app.post("/api/pets", async (req, res) => {
  console.log("=== CREATE PET HIT ===");

  try {
    console.log("BODY:", req.body);

    const {
      petId,
      name,
      dateOfBirth,
      sex,
      kennelId,
      breed,
      behavioralNotes,
      dateOfAdmittance,
      specialNotes,
      status,
    } = req.body;

    const query = `
      INSERT INTO pet 
      (petId, name, dateOfBirth, age, sex, kennelId, breed, behavioralNotes, dateOfAdmittance, daysInShelter, specialNotes, status)
      VALUES (?, ?, ?, TIMESTAMPDIFF(YEAR, ?, CURDATE()), ?, ?, ?, ?, ?, DATEDIFF(CURDATE(), ?), ?, ?)
    `;

    const values = [
      petId,
      name,
      dateOfBirth,
      dateOfBirth,
      sex,
      kennelId,
      breed,
      behavioralNotes,
      dateOfAdmittance,
      dateOfAdmittance,
      specialNotes,
      status,
    ];

    console.log("QUERY:", query);
    console.log("VALUES:", values);

    const result = await pool.query(query, values);

    console.log("RESULT:", result);

    res.json({ message: "Pet created" });

  } catch (err) {
    console.error("🔥 ERROR CAUGHT:", err);

    res.status(500).json({
      error: err.message || "Unknown error",
    });
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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});