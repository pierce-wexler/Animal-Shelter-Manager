
import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Expect:
    // Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Invalid authorization header",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    // Attach decoded user payload:
    // {
    //   userId,
    //   role,
    //   isAdmin,
    //   iat,
    //   exp
    // }
    req.user = decoded;

    next();

  } catch (err) {
    console.error("verifyToken error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      error: "Authentication failed",
    });
  }
}
