
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL ADOPTION REQUESTS
  // For frontend database table view
  // ==================================================
  router.get(
    "/adoption-requests",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            requestId,
            submitterId,
            petId,
            description,
            status,
            fulfilledBy,
            adoptionType
          FROM adoption_request
          ORDER BY requestId DESC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch requests",
        });
      }
    }
  );

  // ==================================================
  // GET SINGLE REQUEST
  // ==================================================
  router.get(
    "/adoption-requests/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await pool.query(
          `
          SELECT *
          FROM adoption_request
          WHERE requestId = ?
          `,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            error: "Request not found",
          });
        }

        res.json(rows[0]);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch request",
        });
      }
    }
  );

  // ==================================================
  // CREATE REQUEST
  // ==================================================
  router.post(
    "/adoption-requests",
    verifyToken,
    async (req, res) => {
      const {
        submitterId,
        petId,
        description,
        status,
        fulfilledBy,
        adoptionType,
      } = req.body;

      if (!submitterId || !petId || !adoptionType) {
        return res.status(400).json({
          error: "submitterId, petId, and adoptionType are required",
        });
      }

      try {
        const [result] = await pool.query(
          `
          INSERT INTO adoption_request
          (
            submitterId,
            petId,
            description,
            status,
            fulfilledBy,
            adoptionType
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            submitterId,
            petId,
            description || null,
            status || "pending",
            fulfilledBy || null,
            adoptionType,
          ]
        );

        res.status(201).json({
          message: "Request created successfully",
          requestId: result.insertId,
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to create request",
        });
      }
    }
  );

  // ==================================================
  // UPDATE REQUEST
  // ==================================================
  router.put(
    "/adoption-requests/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      const {
        submitterId,
        petId,
        description,
        status,
        fulfilledBy,
        adoptionType,
      } = req.body;

      try {
        const [result] = await pool.query(
          `
          UPDATE adoption_request
          SET
            submitterId = ?,
            petId = ?,
            description = ?,
            status = ?,
            fulfilledBy = ?,
            adoptionType = ?
          WHERE requestId = ?
          `,
          [
            submitterId,
            petId,
            description,
            status,
            fulfilledBy || null,
            adoptionType,
            id,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Request not found",
          });
        }

        res.json({
          message: "Request updated successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to update request",
        });
      }
    }
  );

  // ==================================================
  // DELETE REQUEST
  // ==================================================
  router.delete(
    "/adoption-requests/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await pool.query(
          `
          DELETE FROM adoption_request
          WHERE requestId = ?
          `,
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Request not found",
          });
        }

        res.json({
          message: "Request deleted successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to delete request",
        });
      }
    }
  );

  return router;
};
