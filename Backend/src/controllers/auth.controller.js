import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Registration controller
export const register = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const { username, password } = req.body;

    // Validate username
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 5 || normalizedUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be between 5 and 20 characters",
      });
    }

    // Validate password
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || !hasSpecialChar) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one special character",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username: normalizedUsername, passwordHash });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Duplicate username
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return res.status(500).json({ message: "Server error during registration" });
  }
};


//login controller
// must check for username: user name  exist, much be a string, can' tbe just white spaces, normalize to lowercase and trim
//for password: must be a string, can' t be empty and exist


export const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const { username, password } = req.body;

    // Validate username
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Validate password (treat whitespace-only as invalid)
    if (typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user and explicitly include passwordHash
    const user = await User.findOne({ username: normalizedUsername })
      .select("+passwordHash");

    // Generic auth failure (no user enumeration)
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};
