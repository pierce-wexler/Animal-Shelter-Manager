
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Route Files
import authRoutes from "./routes/auth.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import usersRoutes from "./routes/users.js";
import petsRoutes from "./routes/pets.js";
import eventsRoutes from "./routes/events.js";
import recordsRoutes from "./routes/records.js";
import requestsRoutes from "./routes/requests.js";

// Load .env variables
dotenv.config();

const app = express();

// ==================================================
// Middleware
// ==================================================
app.use(cors());
app.use(express.json());

// ==================================================
// MySQL Pool
// ==================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "animal_shelter",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB Connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to MySQL database");
    conn.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

// ==================================================
// API ROUTES
// ==================================================
app.use("/api", authRoutes(pool));
app.use("/api", adminUsersRoutes(pool));
app.use("/api", usersRoutes(pool));
app.use("/api", petsRoutes(pool));
app.use("/api", eventsRoutes(pool));
app.use("/api", recordsRoutes(pool));
app.use("/api", requestsRoutes(pool));

// ==================================================
// Health Check
// ==================================================
app.get("/", (req, res) => {
  res.send("Animal Shelter Manager API Running");
});

// ==================================================
// 404 Handler
// ==================================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ==================================================
// Start Server
// ==================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});