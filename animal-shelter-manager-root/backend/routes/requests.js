import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL REQUESTS (basic)
  // ==================================================
  router.get("/adoption-requests", verifyToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT requestId, submitterId, petId, description, status, fufilledBy, adoptionType
        FROM adoption_request
        ORDER BY requestId DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // ==================================================
  // GET FULL REQUEST VIEW
  // ==================================================
  router.get("/adoption-requests/full", verifyToken, async (req, res) => {
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

          CONCAT(sub.fname, ' ', sub.lname) AS submitterName,
          CONCAT(st.fname, ' ', st.lname) AS staffName,

          p.name AS petName,
          p.breed AS petBreed,

          ad.blacklistFlag,
          ad.qualificationNotes

        FROM adoption_request ar
        LEFT JOIN app_user sub ON ar.submitterId = sub.userId
        LEFT JOIN app_user st ON ar.fufilledBy = st.userId
        LEFT JOIN adopter ad ON ar.submitterId = ad.userId
        LEFT JOIN pet p ON ar.petId = p.petId
        ORDER BY ar.requestId DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // ==================================================
  // GET MY REQUESTS
  // ==================================================
  router.get("/adoption-requests/my", verifyToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const [rows] = await pool.query(`
        SELECT ar.*, p.name AS petName, p.breed AS petBreed
        FROM adoption_request ar
        LEFT JOIN pet p ON ar.petId = p.petId
        WHERE ar.submitterId = ?
        ORDER BY ar.requestId DESC
      `, [userId]);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user requests" });
    }
  });

  // ==================================================
  // CREATE REQUEST
  // ==================================================
  router.post("/adoption-requests", verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;

    const { petId, description, adoptionType } = req.body;

    if (role?.toLowerCase() !== "adopter") {
      return res.status(403).json({ error: "Only adopters can submit requests" });
    }

    if (!petId || !adoptionType) {
      return res.status(400).json({ error: "petId and adoptionType are required" });
    }

    try {
      const [petRows] = await pool.query(
        "SELECT status FROM pet WHERE petId = ?",
        [petId]
      );

      if (petRows.length === 0) {
        return res.status(404).json({ error: "Pet not found" });
      }

      if (petRows[0].status?.toLowerCase() !== "available") {
        return res.status(400).json({ error: "Pet is not available" });
      }

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

      const [result] = await pool.query(`
        INSERT INTO adoption_request
        (submitterId, petId, description, status, fufilledBy, adoptionType)
        VALUES (?, ?, ?, 'pending', NULL, ?)
      `, [userId, petId, description || null, adoptionType]);

      res.status(201).json({
        message: "Request submitted successfully",
        requestId: result.insertId,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  // ==================================================
  // APPROVE (UPDATED FOR DATES)
  // ==================================================
  router.put("/adoption-requests/:id/approve", verifyToken, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const requestId = req.params.id;
      const staffId = req.user.userId;
      const { startDate, endDate } = req.body;

      await connection.beginTransaction();

      const [rows] = await connection.query(
        "SELECT * FROM adoption_request WHERE requestId = ?",
        [requestId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Request not found" });
      }

      const request = rows[0];

      if (request.status !== "pending") {
        await connection.rollback();
        return res.status(400).json({
          error: "Request already processed",
        });
      }

      // 🔥 VALIDATION
      if (!startDate) {
        await connection.rollback();
        return res.status(400).json({
          error: "Start date is required",
        });
      }

      if (request.adoptionType === "foster" && !endDate) {
        await connection.rollback();
        return res.status(400).json({
          error: "End date required for foster",
        });
      }

      // UPDATE REQUEST
      await connection.query(`
        UPDATE adoption_request
        SET status = 'approved',
            fufilledBy = ?
        WHERE requestId = ?
      `, [staffId, requestId]);

      // CREATE RECORD
      const [recordResult] = await connection.query(`
        INSERT INTO record (petId, recordType, notes, dateOfRecord)
        VALUES (?, ?, 'Request approved', ?)
      `, [
        request.petId,
        request.adoptionType === "foster" ? "foster" : "adoption",
        startDate
      ]);

      const recordId = recordResult.insertId;

      // TYPE-SPECIFIC RECORD
      if (request.adoptionType === "foster") {
        await connection.query(`
          INSERT INTO foster_record (recordId, status, fosterEndDate)
          VALUES (?, 'active', ?)
        `, [recordId, endDate]);

        await connection.query(`
          UPDATE pet SET status = 'Fostered'
          WHERE petId = ?
        `, [request.petId]);

      } else {
        await connection.query(`
          INSERT INTO adoption_record (recordId, adopterId, staffId)
          VALUES (?, ?, ?)
        `, [recordId, request.submitterId, staffId]);

        await connection.query(`
          UPDATE pet SET status = 'Adopted'
          WHERE petId = ?
        `, [request.petId]);
      }

      await connection.commit();

      res.json({ message: "Request approved and record created" });

    } catch (err) {
      await connection.rollback();
      console.error(err);
      res.status(500).json({ error: "Approval failed" });
    } finally {
      connection.release();
    }
  });

  // ==================================================
  // DENY
  // ==================================================
  router.put("/adoption-requests/:id/deny", verifyToken, async (req, res) => {
    try {
      const requestId = req.params.id;
      const staffId = req.user.userId;

      const [rows] = await pool.query(
        "SELECT * FROM adoption_request WHERE requestId = ?",
        [requestId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Request not found" });
      }

      const request = rows[0];

      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Request already processed",
        });
      }

      await pool.query(`
        UPDATE adoption_request
        SET status = 'denied',
            fufilledBy = ?
        WHERE requestId = ?
      `, [staffId, requestId]);

      res.json({ message: "Request denied" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Deny failed" });
    }
  });

  return router;
};