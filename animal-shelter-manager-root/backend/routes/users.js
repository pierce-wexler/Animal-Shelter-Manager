
import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

export default (pool) => {

  // ==================================================
  // GET ALL USERS
  // For frontend database table view
  // Admin only
  // ==================================================
  router.get(
    "/users",
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
              WHEN s.userId IS NOT NULL
                   AND LOWER(u.email) = 'admin@shelter.com'
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
          LEFT JOIN adopter a
            ON u.userId = a.userId
          LEFT JOIN staff s
            ON u.userId = s.userId
          LEFT JOIN volunteer v
            ON u.userId = v.userId

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
  // GET SINGLE USER
  // Admin only
  // ==================================================
  router.get(
    "/users/:id",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await pool.query(
          `
          SELECT
            u.userId,
            u.fname,
            u.lname,
            u.email,

            a.qualificationNotes,
            a.blacklistFlag,

            s.supervisor AS staffSupervisor,
            v.supervisor AS volunteerSupervisor

          FROM app_user u
          LEFT JOIN adopter a
            ON u.userId = a.userId
          LEFT JOIN staff s
            ON u.userId = s.userId
          LEFT JOIN volunteer v
            ON u.userId = v.userId
          WHERE u.userId = ?
          `,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            error: "User not found",
          });
        }

        res.json(rows[0]);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch user",
        });
      }
    }
  );

  // ==================================================
  // GET USERS BY ROLE
  // Example:
  // /users/role/staff
  // ==================================================
  router.get(
    "/users/role/:role",
    verifyToken,
    requireAdmin,
    async (req, res) => {
      const role = req.params.role.toLowerCase();

      try {
        let query = "";

        if (role === "adopter") {
          query = `
            SELECT u.userId, u.fname, u.lname, u.email
            FROM app_user u
            INNER JOIN adopter a
              ON u.userId = a.userId
          `;
        } else if (role === "staff") {
          query = `
            SELECT u.userId, u.fname, u.lname, u.email
            FROM app_user u
            INNER JOIN staff s
              ON u.userId = s.userId
            WHERE LOWER(u.email) <> 'admin@shelter.com'
          `;
        } else if (role === "admin") {
          query = `
            SELECT u.userId, u.fname, u.lname, u.email
            FROM app_user u
            INNER JOIN staff s
              ON u.userId = s.userId
            WHERE LOWER(u.email) = 'admin@shelter.com'
          `;
        } else if (role === "volunteer") {
          query = `
            SELECT u.userId, u.fname, u.lname, u.email
            FROM app_user u
            INNER JOIN volunteer v
              ON u.userId = v.userId
          `;
        } else {
          return res.status(400).json({
            error: "Invalid role",
          });
        }

        const [rows] = await pool.query(query);

        res.json(rows);

      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Failed to fetch users by role",
        });
      }
    }
  );

  return router;
};
