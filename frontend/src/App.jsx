import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./components/dashboard/Chatbot";
import DustLevelAnalysis from "./pages/DustLevelAnalysis";
import OccupancyAnalysis from "./pages/OccupancyAnalysis";
import TemperatureHumidityAnalysis from "./pages/TemperatureHumidityAnalysis";
import AirQualityAnalysis from "./pages/AirQualityAnalysis";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chatbot" element={<Chatbot latestData={{}} />} />
      <Route path="/dust" element={<DustLevelAnalysis />} />
      <Route path="/occupancy" element={<OccupancyAnalysis />} />
      <Route path="/temperature-humidity" element={<TemperatureHumidityAnalysis />} />
      <Route path="/air-quality" element={<AirQualityAnalysis />} />
    </Routes>
  );
}

export default App;