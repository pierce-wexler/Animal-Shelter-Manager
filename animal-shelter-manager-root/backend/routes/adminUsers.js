import express from "express";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL USERS (for admin table view)
  // ==================================================
  router.get(
    "/admin/users",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT 
            u.userId,
            u.fname,
            u.lname,
            u.email,

            CASE
              WHEN s.userId IS NOT NULL AND u.email = 'admin@shelter.com'
                THEN 'admin'
              WHEN s.userId IS NOT NULL
                THEN 'staff'
              WHEN v.userId IS NOT NULL
                THEN 'volunteer'
              WHEN a.userId IS NOT NULL
                THEN 'adopter'
              ELSE 'unknown'
            END AS roleType

          FROM app_user u
          LEFT JOIN adopter a ON u.userId = a.userId
          LEFT JOIN staff s ON u.userId = s.userId
          LEFT JOIN volunteer v ON u.userId = v.userId

          ORDER BY u.userId ASC
        `);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch users",
        });
      }
    }
  );

  // ==================================================
  // CREATE USER
  // ==================================================
  router.post(
    "/admin/users",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      const {
        fname,
        lname,
        email,
        password,
        roleType,
        qualificationNotes,
        blacklistFlag,
        supervisor,
      } = req.body;

      if (!fname || !lname || !email || !password || !roleType) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      const conn = await pool.getConnection();

      try {
        const hash = await bcrypt.hash(password, 10);

        await conn.beginTransaction();

        // Base user
        const [result] = await conn.query(
          `INSERT INTO app_user
          (fname, lname, email, passwordHash)
          VALUES (?, ?, ?, ?)`,
          [fname, lname, email, hash]
        );

        const userId = result.insertId;

        // Role table insert
        if (roleType === "adopter") {
          await conn.query(
            `INSERT INTO adopter
            (userId, qualificationNotes, blacklistFlag)
            VALUES (?, ?, ?)`,
            [
              userId,
              qualificationNotes || "",
              blacklistFlag || 0,
            ]
          );

        } else if (
          roleType === "staff" ||
          roleType === "admin"
        ) {
          await conn.query(
            `INSERT INTO staff
            (userId, supervisor)
            VALUES (?, ?)`,
            [userId, supervisor || null]
          );

        } else if (roleType === "volunteer") {
          await conn.query(
            `INSERT INTO volunteer
            (userId, supervisor)
            VALUES (?, ?)`,
            [userId, supervisor || null]
          );

        } else {
          throw new Error("Invalid role");
        }

        await conn.commit();

        res.status(201).json({
          message: "User created successfully",
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: "Email already exists",
          });
        }

        res.status(500).json({
          error: "Failed to create user",
        });

      } finally {
        conn.release();
      }
    }
  );

  // ==================================================
  // UPDATE USER
  // ==================================================
  router.put(
    "/admin/users/:id",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      const { id } = req.params;

      const {
        fname,
        lname,
        email,
        password,
      } = req.body;

      try {
        const fields = [];
        const values = [];

        if (fname) {
          fields.push("fname = ?");
          values.push(fname);
        }

        if (lname) {
          fields.push("lname = ?");
          values.push(lname);
        }

        if (email) {
          fields.push("email = ?");
          values.push(email);
        }

        if (password) {
          const hash = await bcrypt.hash(password, 10);
          fields.push("passwordHash = ?");
          values.push(hash);
        }

        if (fields.length === 0) {
          return res.status(400).json({
            error: "No fields provided",
          });
        }

        values.push(id);

        const [result] = await pool.query(
          `UPDATE app_user
           SET ${fields.join(", ")}
           WHERE userId = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "User not found",
          });
        }

        res.json({
          message: "User updated successfully",
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to update user",
        });
      }
    }
  );

  // ==================================================
  // DELETE USER
  // ==================================================
  router.delete(
    "/admin/users/:id",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      const { id } = req.params;

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        // remove child role tables first
        await conn.query(
          "DELETE FROM adopter WHERE userId = ?",
          [id]
        );

        await conn.query(
          "DELETE FROM volunteer WHERE userId = ?",
          [id]
        );

        await conn.query(
          "DELETE FROM staff WHERE userId = ?",
          [id]
        );

        // remove base user
        const [result] = await conn.query(
          "DELETE FROM app_user WHERE userId = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          await conn.rollback();

          return res.status(404).json({
            error: "User not found",
          });
        }

        await conn.commit();

        res.json({
          message: "User deleted successfully",
        });

      } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(500).json({
          error: "Failed to delete user",
        });

      } finally {
        conn.release();
      }
    }
  );

  return router;
};

