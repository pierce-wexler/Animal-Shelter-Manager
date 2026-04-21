
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
            fufilledBy,
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

  router.get(
    "/adoption-requests/full",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            ar.requestId,
            ar.submitterId,
            ar.petId,
            ar.description,
            ar.status,
            ar.fufilledBy,
            ar.adoptionType,

            -- SUBMITTER (adopter name)
            CONCAT(sub.fname, ' ', sub.lname) AS submitterName,

            -- STAFF (fulfilledBy)
            CONCAT(st.fname, ' ', st.lname) AS staffName,

            -- PET
            p.name AS petName,
            p.breed AS petBreed,

            -- ADOPTER DETAILS
            ad.blacklistFlag,
            ad.qualificationNotes

          FROM adoption_request ar

          -- SUBMITTER USER
          LEFT JOIN app_user sub
            ON ar.submitterId = sub.userId

          -- STAFF USER
          LEFT JOIN app_user st
            ON ar.fufilledBy = st.userId

          -- ADOPTER (extra fields)
          LEFT JOIN adopter ad
            ON ar.submitterId = ad.userId

          -- PET
          LEFT JOIN pet p
            ON ar.petId = p.petId

          ORDER BY ar.requestId DESC;
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


  router.get("/adoption-requests/my", verifyToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const [rows] = await pool.query(
        `
      SELECT 
          ar.*,
          p.name AS petName,
          p.breed AS petBreed
        FROM adoption_request ar
        LEFT JOIN pet p ON ar.petId = p.petId
        WHERE ar.submitterId = ?
        ORDER BY ar.requestId DESC
      `,
        [userId]
      );

      res.json(rows);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to fetch user requests",
      });
    }
  });

  // ==================================================
  // CREATE REQUEST
  // ==================================================
  router.post(
    "/adoption-requests",
    verifyToken,
    async (req, res) => {
      const userId = req.user.userId;
      const role = req.user.role;

      const { petId, description, adoptionType } = req.body;

      // -------------------------------
      // ROLE CHECK
      // -------------------------------
      if (role?.toLowerCase() !== "adopter") {
        return res.status(403).json({
          error: "Only adopters can submit requests",
        });
      }

      if (!petId || !adoptionType) {
        return res.status(400).json({
          error: "petId and adoptionType are required",
        });
      }

      try {
        // -------------------------------
        // CHECK PET EXISTS + AVAILABLE
        // -------------------------------
        const [petRows] = await pool.query(
          "SELECT status FROM pet WHERE petId = ?",
          [petId]
        );

        if (petRows.length === 0) {
          return res.status(404).json({
            error: "Pet not found",
          });
        }

        if (petRows[0].status?.toLowerCase() !== "available") {
          return res.status(400).json({
            error: "Pet is not available",
          });
        }

        // -------------------------------
        // PREVENT DUPLICATES
        // -------------------------------
        const [existing] = await pool.query(
          `SELECT * FROM adoption_request
         WHERE submitterId = ? AND petId = ? AND status = 'pending'`,
          [userId, petId]
        );

        if (existing.length > 0) {
          return res.status(400).json({
            error: "You already have a pending request for this pet",
          });
        }

        // -------------------------------
        // INSERT REQUEST
        // -------------------------------
        const [result] = await pool.query(
          `
        INSERT INTO adoption_request
        (
          submitterId,
          petId,
          description,
          status,
          fufilledBy,
          adoptionType
        )
        VALUES (?, ?, ?, 'pending', NULL, ?)
        `,
          [
            userId,
            petId,
            description || null,
            adoptionType,
          ]
        );

        res.status(201).json({
          message: "Request submitted successfully",
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
        fufilledBy,
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
            fufilledBy = ?,
            adoptionType = ?
          WHERE requestId = ?
          `,
          [
            submitterId,
            petId,
            description,
            status,
            fufilledBy || null,
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
