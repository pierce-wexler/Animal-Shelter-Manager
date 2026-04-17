
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL PETS
  // For frontend database table view
  // ==================================================
  router.get(
    "/pets",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            petId,
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
          FROM pet
          ORDER BY petId ASC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch pets",
        });
      }
    }
  );

  // ==================================================
  // GET SINGLE PET
  // ==================================================
  router.get(
    "/pets/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await pool.query(
          `SELECT *
           FROM pet
           WHERE petId = ?`,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            error: "Pet not found",
          });
        }

        res.json(rows[0]);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch pet",
        });
      }
    }
  );

  // ==================================================
  // CREATE PET
  // ==================================================
  router.post(
    "/pets",
    verifyToken,
    async (req, res) => {
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

      if (!name) {
        return res.status(400).json({
          error: "Pet name is required",
        });
      }

      try {
        const [result] = await pool.query(
          `INSERT INTO pet
          (
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
            age || null,
            sex || null,
            kennelId || null,
            breed || null,
            behavioralNotes || null,
            dateOfAdmittance || null,
            daysInShelter || null,
            specialNotes || null,
            status || null,
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
    }
  );

  // ==================================================
  // UPDATE PET
  // ==================================================
  router.put(
    "/pets/:id",
    verifyToken,
    async (req, res) => {
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
            age || null,
            sex || null,
            kennelId || null,
            breed || null,
            behavioralNotes || null,
            dateOfAdmittance || null,
            daysInShelter || null,
            specialNotes || null,
            status || null,
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
    }
  );

  // ==================================================
  // DELETE PET
  // ==================================================
  router.delete(
    "/pets/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await pool.query(
          `DELETE FROM pet
           WHERE petId = ?`,
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
    }
  );

  // ==================================================
  // GET ALL KENNELS
  // ==================================================
  router.get(
    "/kennels",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            kennelId,
            roomNo,
            occupationStatus
          FROM kennel
          ORDER BY kennelId ASC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch kennels",
        });
      }
    }
  );

  // ==================================================
  // CREATE KENNEL
  // ==================================================
  router.post(
    "/kennels",
    verifyToken,
    async (req, res) => {
      const {
        roomNo,
        occupationStatus,
      } = req.body;

      if (!roomNo) {
        return res.status(400).json({
          error: "roomNo is required",
        });
      }

      try {
        const [result] = await pool.query(
          `INSERT INTO kennel
          (
            roomNo,
            occupationStatus
          )
          VALUES (?, ?)`,
          [
            roomNo,
            occupationStatus || false,
          ]
        );

        res.status(201).json({
          message: "Kennel created successfully",
          kennelId: result.insertId,
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to create kennel",
        });
      }
    }
  );

  // ==================================================
  // UPDATE KENNEL
  // ==================================================
  router.put(
    "/kennels/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;
      const {
        roomNo,
        occupationStatus,
      } = req.body;

      try {
        const [result] = await pool.query(
          `UPDATE kennel
           SET
             roomNo = ?,
             occupationStatus = ?
           WHERE kennelId = ?`,
          [
            roomNo,
            occupationStatus,
            id,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Kennel not found",
          });
        }

        res.json({
          message: "Kennel updated successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to update kennel",
        });
      }
    }
  );

  // ==================================================
  // DELETE KENNEL
  // ==================================================
  router.delete(
    "/kennels/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await pool.query(
          `DELETE FROM kennel
           WHERE kennelId = ?`,
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Kennel not found",
          });
        }

        res.json({
          message: "Kennel deleted successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to delete kennel",
        });
      }
    }
  );

  return router;
};
