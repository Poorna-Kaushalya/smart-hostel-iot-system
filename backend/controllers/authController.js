const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { addUser, findUserByEmail } = require("../models/userStore");
const { db, admin } = require("../firebase");

const SECRET = process.env.JWT_SECRET;

// SIGNUP
async function signup(req, res) {
  const { name, email, password } = req.body;

  if (findUserByEmail(email)) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = { name, email, password: hashed };
  addUser(user);

  try {
    await db.collection("users").add({
      name,
      email,
      password: hashed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("User saved to Firebase:", email);
  } catch (error) {
    console.error("Firebase save error:", error.message);
    return res.status(500).json({ message: "Failed to save user in Firebase" });
  }

  res.json({ message: "User created" });
}

// LOGIN
async function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, name: user.name }, SECRET, { expiresIn: "1d" });
  res.json({ token, user: { name: user.name, email: user.email } });
}

module.exports = { signup, login };