
import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ==========================
// HELPERS
// ==========================
const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const calculateDaysInShelter = (admitDate) => {
  if (!admitDate) return 0;
  const start = new Date(admitDate);
  const today = new Date();

  const diff = today - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export default (pool) => {

  // ==================================================
  // GET ALL PETS
  // ==================================================
  router.get("/pets", verifyToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM pet
        ORDER BY petId ASC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch pets" });
    }
  });

  // ==================================================
  // CREATE PET (UPGRADED)
  // ==================================================
  router.post("/pets", verifyToken, async (req, res) => {
    let {
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

    if (!name) {
      return res.status(400).json({
        error: "Pet name is required",
      });
    }

    try {
      // ==========================
      // AGE LOGIC
      // ==========================
      let finalAge = 0;

      if (dateOfBirth) {
        finalAge = calculateAge(dateOfBirth);
      } else if (age) {
        finalAge = age;
      }

      // ==========================
      // DAYS IN SHELTER LOGIC
      // ==========================
      let finalDays = 0;

      if (dateOfAdmittance) {
        finalDays = calculateDaysInShelter(dateOfAdmittance);
      } else if (daysInShelter) {
        finalDays = daysInShelter;
      }

      const [result] = await pool.query(
        `INSERT INTO pet (
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
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          dateOfBirth || null,
          finalAge,
          sex || "",
          kennelId || null,
          breed || "",
          behavioralNotes || "",      
          dateOfAdmittance || null,
          finalDays,
          specialNotes || "",
          status || "Available",
        ]
      );

      res.status(201).json({
        message: "Pet created successfully",
        petId: result.insertId,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to create pet",
      });
    }
  });

  // ==================================================
  // UPDATE PET (UPGRADED)
  // ==================================================
  router.put("/pets/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    let {
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
      let finalAge = 0;

      if (dateOfBirth) {
        finalAge = calculateAge(dateOfBirth);
      } else if (age) {
        finalAge = age;
      }

      let finalDays = 0;

      if (dateOfAdmittance) {
        finalDays = calculateDaysInShelter(dateOfAdmittance);
      } else if (daysInShelter) {
        finalDays = daysInShelter;
      }

      const [result] = await pool.query(
        `UPDATE pet
         SET
           name = ?,
           dateOfBirth = ?,
           age = ?,
           sex = ?,
           kennelId = ?,
           breed = ?,
           behavioralNotes = ?,
           dateOfAdmittance = ?,
           daysInShelter = ?,
           specialNotes = ?,
           status = ?
         WHERE petId = ?`,
        [
          name,
          dateOfBirth || null,
          finalAge,
          sex || "",
          kennelId || null,
          breed || "",
          behavioralNotes || "",
          dateOfAdmittance || null,
          finalDays,
          specialNotes || "",
          status || "Available",
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Pet not found",
        });
      }

      res.json({
        message: "Pet updated successfully",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to update pet",
      });
    }
  });

  // ==================================================
  // DELETE PET
  // ==================================================
  router.delete("/pets/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await pool.query(
        `DELETE FROM pet WHERE petId = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Pet not found",
        });
      }

      res.json({
        message: "Pet deleted successfully",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to delete pet",
      });
    }
  });

  // ============================
  // STORAGE CONFIG (CLEAN)
  // ============================
  const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const petId = req.params.id;

      // Force consistent naming
      cb(null, `pet-${petId}.jpg`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

  // ============================
  // UPLOAD IMAGE
  // ============================
  router.post(
    "/pets/:id/image",
    verifyToken,
    upload.single("image"),
    async (req, res) => {
      const { id } = req.params;

      const [rows] = await pool.query(
        "SELECT petId FROM pet WHERE petId = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: "Pet not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      res.json({
        message: "Image uploaded successfully",
      });
    }
  );

  return router;
};
