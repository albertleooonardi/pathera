import Users from "../model/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Never send the password hash or session token back to the client
const PUBLIC_ATTRIBUTES = [
  "id",
  "name",
  "email",
  "degree",
  "years_of_experience",
  "createdAt",
  "updatedAt",
];

const toPublicUser = (user) =>
  Object.fromEntries(PUBLIC_ATTRIBUTES.map((key) => [key, user[key]]));

class UserController {
  static async register(req, res) {
    try {
      const { name, email, password, confirm_password } = req.body;
      const errors = {};
      if (typeof name !== "string" || !name.trim()) {
        errors.name = "Name is required!";
      } else if (name.trim().length < 3) {
        errors.name = "Name must be at least 3 characters!";
      }
      if (typeof email !== "string" || !email) {
        errors.email = "Email is required!";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Email is in an invalid format!";
      } else if (await Users.findOne({ where: { email } })) {
        errors.email = "Email already exists!";
      }
      if (typeof password !== "string" || !password) {
        errors.password = "Password is required!";
      } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters!";
      }
      if (password !== confirm_password) {
        errors.cpassword = "Passwords do not match!";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Users.create({
        name: name.trim(),
        email,
        password: hashedPassword,
      });

      return res.status(201).json(toPublicUser(user));
    } catch (error) {
      console.error("Error in register:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const errors = {};

      if (typeof email !== "string" || !email) errors.email = "Email is required!";
      if (typeof password !== "string" || !password)
        errors.password = "Password is required!";

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await Users.findOne({ where: { email } });

      // Same message for an unknown email and a wrong password, so accounts can't be enumerated
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(400)
          .json({ errors: { password: "Email or password is incorrect!" } });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      await Users.update({ token }, { where: { id: user.id } });

      res.status(200).json({ token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Runs behind checkToken, so req.user is a verified, unexpired session
  static async auth(req, res) {
    try {
      const user = await Users.findByPk(req.user.id, {
        attributes: PUBLIC_ATTRIBUTES,
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid token!" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error in auth:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async logout(req, res) {
    try {
      await Users.update({ token: null }, { where: { id: req.user.id } });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error in logout:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default UserController;
