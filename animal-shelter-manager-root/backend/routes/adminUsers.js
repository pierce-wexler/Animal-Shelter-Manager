import express from "express";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL USERS (UNIFIED)
  // ==================================================
  router.get("/admin/users/full", verifyToken, async (req, res) => {
    try {
      const role = req.user.role;

      // 🚫 BLOCK ADOPTERS
      if (role === "adopter") {
        return res.status(403).json({
          error: "Access denied",
        });
      }

      const [rows] = await pool.query(`
      SELECT
        u.userId,
        u.fname,
        u.lname,
        u.email,

        CASE
          WHEN s.userId IS NOT NULL AND LOWER(u.email) = 'admin@shelter.com'
            THEN 'admin'
          WHEN s.userId IS NOT NULL
            THEN 'staff'
          WHEN v.userId IS NOT NULL
            THEN 'volunteer'
          WHEN a.userId IS NOT NULL
            THEN 'adopter'
          ELSE 'unknown'
        END AS roleType,

        a.qualificationNotes,
        a.blacklistFlag,

        COALESCE(s.supervisor, v.supervisor) AS supervisor

      FROM app_user u
      LEFT JOIN adopter a ON u.userId = a.userId
      LEFT JOIN staff s ON u.userId = s.userId
      LEFT JOIN volunteer v ON u.userId = v.userId

      ORDER BY u.userId ASC
    `);

      res.json(rows);

    } catch (err) {
      console.error("GET USERS ERROR:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ==================================================
  // CREATE USER
  // ==================================================
  router.post("/admin/users", verifyToken, async (req, res) => {
    const {
      fname,
      lname,
      email,
      password,
      roleType,
      qualificationNotes,
      blacklistFlag,
      supervisor
    } = req.body;

    const role = req.user.role;
    const isAdmin = req.user.isAdmin;

    // 🔐 ACCESS CONTROL
    if (!isAdmin && role !== "staff") {
      return res.status(403).json({ error: "Access denied" });
    }

    // 🔒 STAFF RESTRICTION
    if (role === "staff" && roleType !== "adopter") {
      return res.status(403).json({
        error: "Staff can only create adopters"
      });
    }

    if (!fname || !lname || !email || !password || !roleType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const hash = await bcrypt.hash(password, 10);

      const [result] = await conn.query(
        `INSERT INTO app_user (fname, lname, email, passwordHash)
       VALUES (?, ?, ?, ?)`,
        [fname, lname, email, hash]
      );

      const userId = result.insertId;

      await insertRole(conn, userId, {
        roleType,
        qualificationNotes,
        blacklistFlag,
        supervisor
      });

      await conn.commit();

      res.status(201).json({ message: "User created successfully" });

    } catch (err) {
      await conn.rollback();
      console.error("CREATE USER ERROR:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already exists" });
      }

      res.status(500).json({ error: "Failed to create user" });

    } finally {
      conn.release();
    }
  });

  // ==================================================
  // UPDATE USER
  // ==================================================
  router.put("/admin/users/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    const {
      fname,
      lname,
      email,
      password,
      qualificationNotes,
      blacklistFlag,
      supervisor
    } = req.body;

    const role = req.user.role;
    const isAdmin = req.user.isAdmin;

    // =========================
    // ACCESS CONTROL
    // =========================
    if (!isAdmin && role !== "staff") {
      return res.status(403).json({ error: "Access denied" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // =========================
      // UPDATE BASE USER
      // =========================
      const fields = [];
      const values = [];

      if (fname) { fields.push("fname = ?"); values.push(fname); }
      if (lname) { fields.push("lname = ?"); values.push(lname); }
      if (email) { fields.push("email = ?"); values.push(email); }

      if (password) {
        const hash = await bcrypt.hash(password, 10);
        fields.push("passwordHash = ?");
        values.push(hash);
      }

      if (fields.length > 0) {
        values.push(id);
        await conn.query(
          `UPDATE app_user SET ${fields.join(", ")} WHERE userId = ?`,
          values
        );
      }

      // =========================
      // DETERMINE USER ROLE
      // =========================
      const [rows] = await conn.query(`
      SELECT
        CASE
          WHEN s.userId IS NOT NULL THEN 'staff'
          WHEN v.userId IS NOT NULL THEN 'volunteer'
          WHEN a.userId IS NOT NULL THEN 'adopter'
          ELSE 'unknown'
        END AS roleType
      FROM app_user u
      LEFT JOIN adopter a ON u.userId = a.userId
      LEFT JOIN staff s ON u.userId = s.userId
      LEFT JOIN volunteer v ON u.userId = v.userId
      WHERE u.userId = ?
    `, [id]);

      const roleType = rows[0]?.roleType;

      // =========================
      // UPDATE ROLE-SPECIFIC TABLE
      // =========================
      if (roleType === "adopter") {
        await conn.query(
          `
        UPDATE adopter
        SET qualificationNotes = ?, blacklistFlag = ?
        WHERE userId = ?
        `,
          [qualificationNotes || "", blacklistFlag || 0, id]
        );

      } else if (roleType === "staff" || roleType === "admin") {
        await conn.query(
          `
        UPDATE staff
        SET supervisor = ?
        WHERE userId = ?
        `,
          [supervisor || null, id]
        );

      } else if (roleType === "volunteer") {
        await conn.query(
          `
        UPDATE volunteer
        SET supervisor = ?
        WHERE userId = ?
        `,
          [supervisor || null, id]
        );
      }

      await conn.commit();

      res.json({ message: "User updated successfully" });

    } catch (err) {
      await conn.rollback();
      console.error("UPDATE USER ERROR:", err);
      res.status(500).json({ error: "Failed to update user" });

    } finally {
      conn.release();
    }
  });

  // ==================================================
  // DELETE USER
  // ==================================================
  router.delete("/admin/users/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const role = req.user.role;
    const isAdmin = req.user.isAdmin;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 🔍 Get user role first
      const [rows] = await conn.query(`
      SELECT
        CASE
          WHEN s.userId IS NOT NULL AND LOWER(u.email) = 'admin@shelter.com'
            THEN 'admin'
          WHEN s.userId IS NOT NULL THEN 'staff'
          WHEN v.userId IS NOT NULL THEN 'volunteer'
          WHEN a.userId IS NOT NULL THEN 'adopter'
          ELSE 'unknown'
        END AS roleType
      FROM app_user u
      LEFT JOIN adopter a ON u.userId = a.userId
      LEFT JOIN staff s ON u.userId = s.userId
      LEFT JOIN volunteer v ON u.userId = v.userId
      WHERE u.userId = ?
    `, [id]);

      if (!rows.length) {
        await conn.rollback();
        return res.status(404).json({ error: "User not found" });
      }

      const targetRole = rows[0].roleType;

      // 🔐 ACCESS CONTROL
      if (!isAdmin && role !== "staff") {
        await conn.rollback();
        return res.status(403).json({ error: "Access denied" });
      }

      // 🔒 STAFF RESTRICTION
      if (role === "staff" && targetRole !== "adopter") {
        await conn.rollback();
        return res.status(403).json({
          error: "Staff can only delete adopters"
        });
      }

      await clearRoles(conn, id);

      await conn.query(
        "DELETE FROM app_user WHERE userId = ?",
        [id]
      );

      await conn.commit();

      res.json({ message: "User deleted successfully" });

    } catch (err) {
      await conn.rollback();
      console.error("DELETE USER ERROR:", err);
      res.status(500).json({ error: "Failed to delete user" });

    } finally {
      conn.release();
    }
  });

  // ==================================================
  // HELPER: CLEAR ROLES
  // ==================================================
  const clearRoles = async (conn, userId) => {
    await conn.query("DELETE FROM adopter WHERE userId = ?", [userId]);
    await conn.query("DELETE FROM staff WHERE userId = ?", [userId]);
    await conn.query("DELETE FROM volunteer WHERE userId = ?", [userId]);
  };

  // ==================================================
  // HELPER: INSERT ROLE
  // ==================================================
  const insertRole = async (conn, userId, {
    roleType,
    qualificationNotes,
    blacklistFlag,
    supervisor
  }) => {

    if (roleType === "adopter") {
      await conn.query(
        `INSERT INTO adopter (userId, qualificationNotes, blacklistFlag)
         VALUES (?, ?, ?)`,
        [userId, qualificationNotes || "", blacklistFlag || 0]
      );

    } else if (roleType === "staff" || roleType === "admin") {
      await conn.query(
        `INSERT INTO staff (userId, supervisor)
         VALUES (?, ?)`,
        [userId, supervisor || null]
      );

    } else if (roleType === "volunteer") {
      await conn.query(
        `INSERT INTO volunteer (userId, supervisor)
         VALUES (?, ?)`,
        [userId, supervisor || null]
      );

    } else {
      throw new Error("Invalid role type");
    }
  };

  router.get("/users/me", verifyToken, async (req, res) => {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      "SELECT fname, lname FROM app_user WHERE userId = ?",
      [userId]
    );

    res.json(rows[0]);
  });

  return router;
};