
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL BASE RECORDS
  // For frontend database table view
  // ==================================================
  router.get(
    "/records",
    verifyToken,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT
            r.recordId,
            r.petId,
            r.dateOfRecord,
            r.recordType,
            r.notes
          FROM record r
          ORDER BY r.recordId DESC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch records",
        });
      }
    }
  );

  // ==================================================
  // GET FULL RECORD DETAILS
  // Includes medical / adoption / foster subtype data
  // ==================================================
  router.get(
    "/records/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await pool.query(
          `
          SELECT
            r.recordId,
            r.petId,
            r.dateOfRecord,
            r.recordType,
            r.notes,

            mr.institution,
            mr.vet,

            ar.adopterId,
            ar.staffId,

            fr.status AS fosterStatus,
            fr.staffId AS fosterStaffId

          FROM record r
          LEFT JOIN medical_record mr
            ON r.recordId = mr.recordId
          LEFT JOIN adoption_record ar
            ON r.recordId = ar.recordId
          LEFT JOIN foster_record fr
            ON r.recordId = fr.recordId
          WHERE r.recordId = ?
          `,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            error: "Record not found",
          });
        }

        res.json(rows[0]);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch record",
        });
      }
    }
  );

  // ==================================================
  // CREATE MEDICAL RECORD
  // ==================================================
  router.post(
    "/medical-records",
    verifyToken,
    async (req, res) => {
      const {
        petId,
        dateOfRecord,
        notes,
        institution,
        vet,
      } = req.body;

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const [base] = await conn.query(
          `
          INSERT INTO record
          (petId, dateOfRecord, recordType, notes)
          VALUES (?, ?, 'medical', ?)
          `,
          [
            petId,
            dateOfRecord,
            notes || null,
          ]
        );

        const recordId = base.insertId;

        await conn.query(
          `
          INSERT INTO medical_record
          (recordId, institution, vet)
          VALUES (?, ?, ?)
          `,
          [
            recordId,
            institution || null,
            vet || null,
          ]
        );

        await conn.commit();

        res.status(201).json({
          message: "Medical record created",
          recordId,
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(500).json({
          error: "Failed to create medical record",
        });

      } finally {
        conn.release();
      }
    }
  );

  // ==================================================
  // CREATE ADOPTION RECORD
  // ==================================================
  router.post(
    "/adoption-records",
    verifyToken,
    async (req, res) => {
      const {
        petId,
        dateOfRecord,
        notes,
        adopterId,
        staffId,
      } = req.body;

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const [base] = await conn.query(
          `
          INSERT INTO record
          (petId, dateOfRecord, recordType, notes)
          VALUES (?, ?, 'adoption', ?)
          `,
          [
            petId,
            dateOfRecord,
            notes || null,
          ]
        );

        const recordId = base.insertId;

        await conn.query(
          `
          INSERT INTO adoption_record
          (recordId, adopterId, staffId)
          VALUES (?, ?, ?)
          `,
          [
            recordId,
            adopterId || null,
            staffId || null,
          ]
        );

        await conn.commit();

        res.status(201).json({
          message: "Adoption record created",
          recordId,
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(500).json({
          error: "Failed to create adoption record",
        });

      } finally {
        conn.release();
      }
    }
  );

  // ==================================================
  // CREATE FOSTER RECORD
  // (extends adoption_record)
  // ==================================================
  router.post(
    "/foster-records",
    verifyToken,
    async (req, res) => {
      const {
        petId,
        dateOfRecord,
        notes,
        adopterId,
        staffId,
        status,
      } = req.body;

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const [base] = await conn.query(
          `
          INSERT INTO record
          (petId, dateOfRecord, recordType, notes)
          VALUES (?, ?, 'foster', ?)
          `,
          [
            petId,
            dateOfRecord,
            notes || null,
          ]
        );

        const recordId = base.insertId;

        await conn.query(
          `
          INSERT INTO adoption_record
          (recordId, adopterId, staffId)
          VALUES (?, ?, ?)
          `,
          [
            recordId,
            adopterId || null,
            staffId || null,
          ]
        );

        await conn.query(
          `
          INSERT INTO foster_record
          (recordId, status, staffId)
          VALUES (?, ?, ?)
          `,
          [
            recordId,
            status || null,
            staffId || null,
          ]
        );

        await conn.commit();

        res.status(201).json({
          message: "Foster record created",
          recordId,
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(500).json({
          error: "Failed to create foster record",
        });

      } finally {
        conn.release();
      }
    }
  );

  // ==================================================
  // UPDATE BASE RECORD
  // ==================================================
  router.put(
    "/records/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;
      const {
        petId,
        dateOfRecord,
        notes,
      } = req.body;

      try {
        const [result] = await pool.query(
          `
          UPDATE record
          SET
            petId = ?,
            dateOfRecord = ?,
            notes = ?
          WHERE recordId = ?
          `,
          [
            petId,
            dateOfRecord,
            notes,
            id,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Record not found",
          });
        }

        res.json({
          message: "Record updated successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to update record",
        });
      }
    }
  );

  // ==================================================
  // DELETE RECORD
  // Child tables first
  // ==================================================
  router.delete(
    "/records/:id",
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        await conn.query(
          "DELETE FROM foster_record WHERE recordId = ?",
          [id]
        );

        await conn.query(
          "DELETE FROM medical_record WHERE recordId = ?",
          [id]
        );

        await conn.query(
          "DELETE FROM adoption_record WHERE recordId = ?",
          [id]
        );

        const [result] = await conn.query(
          "DELETE FROM record WHERE recordId = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          await conn.rollback();

          return res.status(404).json({
            error: "Record not found",
          });
        }

        await conn.commit();

        res.json({
          message: "Record deleted successfully",
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(500).json({
          error: "Failed to delete record",
        });

      } finally {
        conn.release();
      }
    }
  );

  return router;
};
