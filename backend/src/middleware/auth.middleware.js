import { verifyAccessToken } from "../lib/jwt.js";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid or Expired Token" });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden - Requires Admin Role" });
  }
}
