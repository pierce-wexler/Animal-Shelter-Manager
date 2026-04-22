// File created/updated with help from chatgpt
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

export default (pool) => {

  // =======================
  // SIGNUP
  // Public signup ONLY creates adopters
  // Staff / volunteer accounts must be created internally
  // =======================
  router.post("/signup", async (req, res) => {
    let { email, password, fname, lname } = req.body;

    email = email?.trim().toLowerCase();
    fname = fname?.trim();
    lname = lname?.trim();

    const role = "adopter";

    if (!email || !password || !fname || !lname) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const conn = await pool.getConnection();

    try {
      const hash = await bcrypt.hash(password, 10);

      await conn.beginTransaction();

      // Create base user
      const [result] = await conn.query(
        "INSERT INTO app_user (email, passwordHash, fname, lname) VALUES (?, ?, ?, ?)",
        [email, hash, fname, lname]
      );

      const userId = result.insertId;

      // Always create adopter profile
      await conn.query(
        "INSERT INTO adopter (userId, qualificationNotes, blacklistFlag) VALUES (?, '', false)",
        [userId]
      );

      await conn.commit();

      res.status(201).json({
        message: "Adopter account created successfully",
        role,
      });

    } catch (err) {
      await conn.rollback();
      console.error("Signup error:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already exists" });
      }

      res.status(500).json({ error: "Signup failed" });

    } finally {
      conn.release();
    }
  });

  // =======================
  // LOGIN
  // =======================
  router.post("/login", async (req, res) => {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    try {
      const [rows] = await pool.query(
        "SELECT * FROM app_user WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = rows[0];

      const match = await bcrypt.compare(password, user.passwordHash);

      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // =======================
      // Determine role
      // =======================
      let role = null;

      const [[staff]] = await pool.query(
        "SELECT userId FROM staff WHERE userId = ?",
        [user.userId]
      );

      const [[adopter]] = await pool.query(
        "SELECT userId FROM adopter WHERE userId = ?",
        [user.userId]
      );

      const [[volunteer]] = await pool.query(
        "SELECT userId FROM volunteer WHERE userId = ?",
        [user.userId]
      );

      if (staff) role = "staff";
      else if (adopter) role = "adopter";
      else if (volunteer) role = "volunteer";

      if (!role) {
        return res.status(500).json({ error: "User role not found" });
      }

      // =======================
      // SPECIFIC SUPERUSER
      // Only this email becomes admin
      // =======================
      const isAdmin =
        role === "staff" &&
        user.email.toLowerCase() === "admin@shelter.com";

      // =======================
      // Generate JWT
      // =======================
      const token = jwt.sign(
        {
          userId: user.userId,
          role,
          isAdmin,
          fname: user.fname,
          lname: user.lname,
        },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        role,
        isAdmin,
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });


  router.put("/users/update-profile", verifyToken, async (req, res) => {
    const userId = req.user.userId;

    const { fname, lname, currentPassword, newPassword } = req.body;

    try {
      // 🔹 Get stored hash
      const [rows] = await pool.query(
        "SELECT passwordHash FROM app_user WHERE userId = ?",
        [userId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = rows[0];

      // 🔐 VERIFY CURRENT PASSWORD
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({
          error: "Current password is incorrect",
        });
      }

      // 🔄 UPDATE PASSWORD IF PROVIDED
      let updatedHash = user.passwordHash;

      if (newPassword) {
        updatedHash = await bcrypt.hash(newPassword, 10);
      }

      // 📝 UPDATE USER
      await pool.query(
        `
      UPDATE app_user
      SET fname = ?, lname = ?, passwordHash = ?
      WHERE userId = ?
      `,
        [fname, lname, updatedHash, userId]
      );

      res.json({ message: "Profile updated successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Update failed" });
    }
  });

  return router;
};
