
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL EVENTS
  // For frontend database table view
  // ==================================================
  router.get(
    "/events",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            eventId,
            eventType,
            eventDateTime,
            staffId,
            volunteerId,
            adopterId,
            petId,
            location
          FROM event
          ORDER BY eventDateTime DESC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch events",
        });
      }
    }
  );

  // ==================================================
  // GET SINGLE EVENT
  // ==================================================
  router.get(
    "/events/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await pool.query(
          `SELECT *
           FROM event
           WHERE eventId = ?`,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            error: "Event not found",
          });
        }

        res.json(rows[0]);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch event",
        });
      }
    }
  );

  // ==================================================
  // CREATE EVENT
  // ==================================================
  router.post(
    "/events",
    verifyToken,
    async (req, res) => {
      const {
        eventType,
        eventDateTime,
        staffId,
        volunteerId,
        adopterId,
        petId,
        location,
      } = req.body;

      if (!eventType || !eventDateTime) {
        return res.status(400).json({
          error: "eventType and eventDateTime are required",
        });
      }

      try {
        const [result] = await pool.query(
          `INSERT INTO event
          (
            eventType,
            eventDateTime,
            staffId,
            volunteerId,
            adopterId,
            petId,
            location
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            eventType,
            eventDateTime,
            staffId || null,
            volunteerId || null,
            adopterId || null,
            petId || null,
            location || null,
          ]
        );

        res.status(201).json({
          message: "Event created successfully",
          eventId: result.insertId,
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to create event",
        });
      }
    }
  );

  // ==================================================
  // UPDATE EVENT
  // ==================================================
  router.put(
    "/events/:id",
    verifyToken,
    async (req, res) => {
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
        const [result] = await pool.query(
          `UPDATE event
           SET
             eventType = ?,
             eventDateTime = ?,
             staffId = ?,
             volunteerId = ?,
             adopterId = ?,
             petId = ?,
             location = ?
           WHERE eventId = ?`,
          [
            eventType,
            eventDateTime,
            staffId || null,
            volunteerId || null,
            adopterId || null,
            petId || null,
            location || null,
            id,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Event not found",
          });
        }

        res.json({
          message: "Event updated successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to update event",
        });
      }
    }
  );

  // ==================================================
  // DELETE EVENT
  // ==================================================
  router.delete(
    "/events/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await pool.query(
          `DELETE FROM event
           WHERE eventId = ?`,
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Event not found",
          });
        }

        res.json({
          message: "Event deleted successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to delete event",
        });
      }
    }
  );

  return router;
};
