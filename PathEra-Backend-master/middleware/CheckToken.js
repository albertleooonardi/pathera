import jwt from "jsonwebtoken";
import Users from "../model/Users.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  // the frontend sends "Bearer null" when nobody is signed in
  return token && token !== "null" && token !== "undefined" ? token : null;
};

// Resolves the signed-in user's id, or null. The token must be a valid, unexpired JWT
// and still stored on the user, so logging out revokes it.
export const getAuthenticatedUserId = async (req) => {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({
      where: { id: decoded.id, token },
      attributes: ["id"],
    });
    return user ? user.id : null;
  } catch (error) {
    return null;
  }
};

const checkToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Invalid token!" });
  }

  req.user = { id: userId };
  next();
};

export default checkToken;
