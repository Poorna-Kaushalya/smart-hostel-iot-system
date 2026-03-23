import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import mqtt from "mqtt";

import logoImg from "../assets/logo.png";
import dashboardImg from "../assets/Smart environment monitoring dashboard setup.png";
import contentImg from "../assets/content.png";
import loginImg from "../assets/login.png";
import signupImg from "../assets/signup.png";

function Home() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const client = mqtt.connect("wss://61e5db1a067944bf9bfb7ac0c63f7e9e.s1.eu.hivemq.cloud:8884", {
    username: "Poorna_Kaushalya",
    password: "kBGJYP49"
  });

  client.on("connect", () => console.log("Connected to MQTT broker from frontend"));

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
      localStorage.setItem("token", res.data.token); // save token
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", signupData);
      alert("Signup successful");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between bg-blue-600 px-10 py-3 text-white">
        <div className="flex items-center space-x-3">
          <img src={logoImg} alt="Logo" className="w-16 h-14" /> 
          <h1 className="text-xl font-bold">Smart Hostel Monitoring</h1>
        </div>
        <div className="space-x-3">
          <Link to="/login" className="border px-4 py-2 rounded">Login</Link>
          <Link to="/signup" className="bg-yellow-400 text-black px-4 py-2 rounded">Sign Up</Link>
        </div>
      </nav>

      <div className="grid md:grid-cols-2 items-center px-20 py-0 bg-gray-100">
        <div>
          <h2 className="text-4xl font-bold mb-4">Monitor and Optimize Your Hostel Environment</h2>
          <p className="text-gray-600 mb-6">
            Leverage real-time IoT data from connected sensors to actively monitor and optimize indoor air quality, thermal comfort,
            and energy efficiency, enabling smarter environments that enhance well-being while reducing energy consumption.
          </p>
          <button onClick={() => navigate("/signup")} className="bg-orange-500 text-white px-6 py-3 rounded">
            Get Started
          </button>
        </div>
        <img src={dashboardImg} alt="dashboard" />
      </div>

      <div className="grid md:grid-cols-9 gap-6 px-5 py-5 items-start">
        <div className="md:col-span-5 flex justify-center items-start">
          <img src={contentImg} alt="dashboard" className="max-w-full rounded shadow" />
        </div>

        <div className="md:col-span-2 bg-blue-100 p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4 text-center">Login</h2>
          <img src={loginImg} alt="login" className="w-72 h-48 mb-5" />
          <input placeholder="Email" className="w-full mb-3 p-2 border rounded"
            onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full mb-3 p-2 border rounded"
            onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded mt-2">Login</button>
        </div>

        <div className="md:col-span-2 bg-green-100 p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-2 text-center">Sign Up</h2>
          <img src={signupImg} alt="signup" className="w-48 h-36 mb-5" />
          <input placeholder="Full Name" className="w-full mb-3 p-2 border rounded"
            onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
          <input placeholder="Email" className="w-full mb-3 p-2 border rounded"
            onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full mb-3 p-2 border rounded"
            onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
          <button onClick={handleSignup} className="w-full bg-orange-500 text-white p-2 rounded mt-2">Sign Up</button>
        </div>
      </div>

      <footer className="bg-blue-600 text-white text-center py-4">
        About | Contact | FAQ
      </footer>
    </div>
  );
}

export default Home;