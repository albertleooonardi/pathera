import jwt from "jsonwebtoken";
import Users from "../model/Users.js";

const checkToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = await Users.findOne({ where: { token } });

    if (!user) {
      return res.status(401).json({ message: "Invalid token!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

export default checkToken;
