import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // ================= RECORD ENDPOINTS =================
  // ==================================================

  // GET ALL RECORDS
  router.get("/records", verifyToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT recordId, petId, dateOfRecord, recordType, notes
        FROM record
        ORDER BY recordId DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  // GET FULL RECORD VIEW
  router.get("/records/full", verifyToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT
          r.recordId,
          r.petId,
          r.dateOfRecord,
          r.recordType,
          r.notes,

          p.name AS petName,
          p.breed AS petBreed,

          mr.institution,
          mr.vet,

          ar.adopterId,
          ar.staffId,

          CONCAT(au.fname, ' ', au.lname) AS adopterName,
          CONCAT(su.fname, ' ', su.lname) AS staffName,

          fr.status AS fosterStatus,
          fr.fosterEndDate

        FROM record r
        LEFT JOIN pet p ON r.petId = p.petId
        LEFT JOIN medical_record mr ON r.recordId = mr.recordId
        LEFT JOIN adoption_record ar ON r.recordId = ar.recordId
        LEFT JOIN foster_record fr ON r.recordId = fr.recordId
        LEFT JOIN app_user au ON ar.adopterId = au.userId
        LEFT JOIN app_user su ON ar.staffId = su.userId

        ORDER BY r.recordId DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch full record data" });
    }
  });

  // CREATE MEDICAL RECORD
  router.post("/medical-records", verifyToken, async (req, res) => {
    const { petId, dateOfRecord, notes, institution, vet } = req.body;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [base] = await conn.query(`
        INSERT INTO record (petId, dateOfRecord, recordType, notes)
        VALUES (?, ?, 'medical', ?)
      `, [petId, dateOfRecord, notes || null]);

      const recordId = base.insertId;

      await conn.query(`
        INSERT INTO medical_record (recordId, institution, vet)
        VALUES (?, ?, ?)
      `, [recordId, institution || null, vet || null]);

      await conn.commit();

      res.status(201).json({ message: "Medical record created", recordId });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Failed to create medical record" });
    } finally {
      conn.release();
    }
  });

  // CREATE ADOPTION RECORD
  router.post("/adoption-records", verifyToken, async (req, res) => {
    const { petId, dateOfRecord, notes, adopterId, staffId } = req.body;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [base] = await conn.query(`
        INSERT INTO record (petId, dateOfRecord, recordType, notes)
        VALUES (?, ?, 'adoption', ?)
      `, [petId, dateOfRecord, notes || null]);

      const recordId = base.insertId;

      await conn.query(`
        INSERT INTO adoption_record (recordId, adopterId, staffId)
        VALUES (?, ?, ?)
      `, [recordId, adopterId || null, staffId || null]);

      await conn.commit();

      res.status(201).json({ message: "Adoption record created", recordId });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Failed to create adoption record" });
    } finally {
      conn.release();
    }
  });

  // CREATE FOSTER RECORD
  router.post("/foster-records", verifyToken, async (req, res) => {
    const {
      petId,
      dateOfRecord,
      notes,
      adopterId,
      staffId,
      status,
      fosterEndDate
    } = req.body;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [base] = await conn.query(`
        INSERT INTO record (petId, dateOfRecord, recordType, notes)
        VALUES (?, ?, 'foster', ?)
      `, [petId, dateOfRecord, notes || null]);

      const recordId = base.insertId;

      // REQUIRED PARENT
      await conn.query(`
        INSERT INTO adoption_record (recordId, adopterId, staffId)
        VALUES (?, ?, ?)
      `, [recordId, adopterId || null, staffId || null]);

      // CHILD
      await conn.query(`
        INSERT INTO foster_record (recordId, status, fosterEndDate)
        VALUES (?, ?, ?)
      `, [recordId, status || "active", fosterEndDate || null]);

      await conn.commit();

      res.status(201).json({ message: "Foster record created", recordId });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Failed to create foster record" });
    } finally {
      conn.release();
    }
  });

  // UPDATE RECORD
  router.put("/records/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { petId, dateOfRecord, notes } = req.body;

    try {
      const [result] = await pool.query(`
        UPDATE record
        SET petId = ?, dateOfRecord = ?, notes = ?
        WHERE recordId = ?
      `, [petId, dateOfRecord, notes, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      res.json({ message: "Record updated successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update record" });
    }
  });

  // DELETE RECORD
  router.delete("/records/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query("DELETE FROM foster_record WHERE recordId = ?", [id]);
      await conn.query("DELETE FROM medical_record WHERE recordId = ?", [id]);
      await conn.query("DELETE FROM adoption_record WHERE recordId = ?", [id]);

      const [result] = await conn.query(
        "DELETE FROM record WHERE recordId = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: "Record not found" });
      }

      await conn.commit();

      res.json({ message: "Record deleted successfully" });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: "Failed to delete record" });
    } finally {
      conn.release();
    }
  });

  // ==================================================
  // ============== ADOPTION REQUEST ENDPOINTS =========
  // ==================================================

  // APPROVE REQUEST (FIXED)
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

      if (!rows.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Request not found" });
      }

      const request = rows[0];

      if (request.status !== "pending") {
        await connection.rollback();
        return res.status(400).json({ error: "Already processed" });
      }

      if (!startDate) {
        await connection.rollback();
        return res.status(400).json({ error: "Start date required" });
      }

      if (request.adoptionType === "foster" && !endDate) {
        await connection.rollback();
        return res.status(400).json({ error: "End date required" });
      }

      await connection.query(`
        UPDATE adoption_request
        SET status='approved', fufilledBy=?
        WHERE requestId=?
      `, [staffId, requestId]);

      const [rec] = await connection.query(`
        INSERT INTO record (petId, recordType, notes, dateOfRecord)
        VALUES (?, ?, 'Request approved', ?)
      `, [request.petId, request.adoptionType, startDate]);

      const recordId = rec.insertId;

      // REQUIRED parent
      await connection.query(`
        INSERT INTO adoption_record (recordId, adopterId, staffId)
        VALUES (?, ?, ?)
      `, [recordId, request.submitterId, staffId]);

      // child if foster
      if (request.adoptionType === "foster") {
        await connection.query(`
    INSERT INTO foster_record (recordId, status, fosterEndDate)
    VALUES (?, 'active', ?)
  `, [recordId, endDate]);

        // FIX: update pet status
        await connection.query(`
    UPDATE pet
    SET status = 'Fostered'
    WHERE petId = ?
  `, [request.petId]);

      } else {
        await connection.query(`
    UPDATE pet
    SET status = 'Adopted'
    WHERE petId = ?
  `, [request.petId]);
      }

      await connection.commit();
      res.json({ message: "Request approved" });

    } catch (err) {
      await connection.rollback();
      console.error(err);
      res.status(500).json({ error: "Approval failed" });
    } finally {
      connection.release();
    }
  });

  return router;
};