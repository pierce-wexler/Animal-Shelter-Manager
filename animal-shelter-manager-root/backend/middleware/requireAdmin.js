
export default function requireAdmin(req, res, next) {
  try {
    // verifyToken middleware should already attach req.user
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Must be admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    next();

  } catch (err) {
    console.error("requireAdmin error:", err);

    return res.status(500).json({
      error: "Authorization failed",
    });
  }
}
