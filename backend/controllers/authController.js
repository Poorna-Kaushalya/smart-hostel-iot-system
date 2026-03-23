const { db } = require("../firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { startMqttClient } = require("../mqttClient");

const mqttClient = startMqttClient();

// Signup 
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check user already exists
    const existingUserSnap = await db.collection("users").where("email", "==", email).get();
    if (!existingUserSnap.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to Firebase
    const userRef = await db.collection("users").add({ name, email, password: hashedPassword });
    console.log("User saved to Firebase:", email);

    mqttClient.publish(
      "hostel/signup",
      JSON.stringify({ name, email, timestamp: new Date().toISOString() }),
      { qos: 1 },
      (err) => {
        if (err) console.log("MQTT publish error:", err.message);
        else console.log("Signup MQTT message sent");
      }
    );

    res.status(200).json({ message: "Signup successful", id: userRef.id });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed" });
  }
};

// Login 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersSnap = await db.collection("users").where("email", "==", email).get();
    if (usersSnap.empty) return res.status(401).json({ message: "Invalid credentials" });

    const userDoc = usersSnap.docs[0];
    const user = userDoc.data();

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: userDoc.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, email: user.email });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { signup, login };