const { db } = require("../firebase");
const { startMqttClient } = require("../mqttClient");

const mqttClient = startMqttClient(); 

// Signup controller
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Save user to Firebase 
    const userRef = await db.collection("users").add({ name, email, password });
    console.log("User saved to Firebase:", email);

    // Publish signup event to MQTT safely
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

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersSnap = await db.collection("users").where("email", "==", email).get();

    if (usersSnap.empty) return res.status(401).json({ message: "Invalid credentials" });

    const user = usersSnap.docs[0].data();
    if (user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", email });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { signup, login };