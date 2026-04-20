
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // =========================================
  // GET ALL KENNELS
  // =========================================
  router.get("/kennels", verifyToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT *
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
  });

  // =========================================
  // CREATE KENNEL
  // =========================================
  router.post("/kennels", verifyToken, async (req, res) => {
    let { roomNo, occupationStatus } = req.body;

    if (!roomNo) {
      return res.status(400).json({
        error: "Room number is required",
      });
    }

    try {
      const [result] = await pool.query(
        `
        INSERT INTO kennel (roomNo, occupationStatus)
        VALUES (?, ?)
        `,
        [
          roomNo,
          occupationStatus ?? 0, // default vacant
        ]
      );

      res.status(201).json({
        message: "Kennel created successfully",
        kennelId: result.insertId,
      });

    } catch (err) {
      console.error(err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error: "Room number already exists",
        });
      }

      res.status(500).json({
        error: "Failed to create kennel",
      });
    }
  });

  // =========================================
  // UPDATE KENNEL
  // =========================================
  router.put("/kennels/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { roomNo, occupationStatus } = req.body;

    try {
      const [result] = await pool.query(
        `
        UPDATE kennel
        SET roomNo = ?, occupationStatus = ?
        WHERE kennelId = ?
        `,
        [
          roomNo,
          occupationStatus ?? 0,
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
  });

  // =========================================
  // DELETE KENNEL
  // =========================================
  router.delete("/kennels/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
      // 🔒 Prevent deleting kennel in use
      const [[pet]] = await pool.query(
        `SELECT petId FROM pet WHERE kennelId = ? LIMIT 1`,
        [id]
      );

      if (pet) {
        return res.status(400).json({
          error: "Cannot delete kennel: it is assigned to a pet",
        });
      }

      const [result] = await pool.query(
        `DELETE FROM kennel WHERE kennelId = ?`,
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
  });

  return router;
};
