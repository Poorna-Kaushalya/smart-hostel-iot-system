# Smart Hostel Environmental Monitoring System

## Overview

The Smart Hostel Environmental Monitoring System is an IoT-based solution designed to monitor and analyze environmental conditions in hostel rooms. The system collects real-time data using sensors and provides insights through a web-based dashboard.

This system enables continuous monitoring of temperature, humidity, air quality, dust levels, occupancy, and power usage. It supports data-driven decision-making for improving comfort, safety, and energy efficiency.

---

## Key Features

- Real-time sensor data collection using ESP32
- Environmental monitoring (temperature, humidity, air quality)
- Dust level analysis and visualization
- Power consumption tracking
- Occupancy detection using PIR sensors
- Interactive dashboard with charts and analytics
- Historical data analysis and filtering
- Alerts for abnormal environmental conditions

---

## System Architecture

1. Sensors collect environmental data
2. ESP32 sends data via MQTT
3. Backend server processes and stores data in Firebase
4. REST API provides data to frontend
5. React dashboard visualizes data

---

## Technologies Used

### Hardware
- ESP32 microcontroller
- DHT22 (Temperature & Humidity)
- MQ135 (Air Quality)
- DSM501B (Dust Sensor)
- PIR Sensor (Occupancy)
- LDR (Light Intensity)
- ACS712 (Current Sensor)

### Software
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js
- Database: Firebase Firestore
- Communication: MQTT (HiveMQ)
- Visualization: Recharts

---

## Data Processing

- Sensor data is collected in real-time
- Data is stored in Firebase
- Backend APIs aggregate and filter data
- Dust values are scaled to µg/m³ for visualization
- Power is calculated using:

```

Power (W) = Voltage × Current

```

(Assuming a 12V system)

---

## Features of Dashboard

- Real-time environmental health panel
- Dust level analysis with trends
- Room-wise data comparison
- Heatmap for weekly dust distribution
- Interactive calendar filtering
- Alerts for critical conditions

---

## Installation

### 1. Clone Repository
```

git clone [https://github.com/Poorna-Kaushalya/smart-hostel-iot-system.git)
cd smart-hostel-iot-system

```

### 2. Install Frontend
```

cd frontend
npm install
npm start

```

### 3. Install Backend
```

cd backend
npm install
node server.js

```

---

## Output Interpretation

- Temperature: Comfort monitoring
- Humidity: Air quality control
- Air Quality: Pollution detection
- Dust: Respiratory risk indicator
- Power: Energy usage monitoring
- Occupancy: Room usage tracking

---

## Future Improvements

- Machine learning for anomaly detection
- Predictive maintenance alerts
- Mobile application integration
- Real-time notifications system
- Multi-room scalability improvements

---

## Conclusion

This system demonstrates an effective integration of IoT, cloud computing, and data visualization to improve environmental monitoring in smart living spaces. It provides a scalable solution for smart hostels and similar environments.

---
