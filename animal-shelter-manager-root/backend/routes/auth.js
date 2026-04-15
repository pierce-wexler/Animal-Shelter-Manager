// File created/updated with help from chatgpt
import express from "express";
import bcrypt from "bcryptjs"; // safer than bcrypt on Windows
import jwt from "jsonwebtoken";

const router = express.Router();

export default (pool) => {

  // =======================
  // SIGNUP
  // =======================
  router.post("/signup", async (req, res) => {
    const { email, password, role, fname, lname } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conn = await pool.getConnection();

    try {
      const hash = await bcrypt.hash(password, 10);

      await conn.beginTransaction();

      // Insert into app_user
      const [result] = await conn.query(
        "INSERT INTO app_user (email, passwordHash, fname, lname) VALUES (?, ?, ?, ?)",
        [email, hash, fname || null, lname || null]
      );

      const userId = result.insertId;

      // Insert into role table
      if (role === "adopter") {
        await conn.query(
          "INSERT INTO adopter (userId, qualificationNotes, blacklistFlag) VALUES (?, '', false)",
          [userId]
        );
      } 
      else if (role === "staff") {
        await conn.query(
          "INSERT INTO staff (userId, supervisor) VALUES (?, NULL)",
          [userId]
        );
      } 
      else if (role === "volunteer") {
        await conn.query(
          "INSERT INTO volunteer (userId, supervisor) VALUES (?, NULL)",
          [userId]
        );
      } 
      else {
        throw new Error("Invalid role");
      }

      await conn.commit();

      res.status(201).json({ message: "User created successfully" });

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
    const { email, password } = req.body;

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

      // Determine role (priority order)
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

      // Create JWT
      const token = jwt.sign(
        {
          userId: user.userId,
          role,
        },
        process.env.JWT_SECRET || "dev_secret", // fallback for dev
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        role,
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  return router;
};
