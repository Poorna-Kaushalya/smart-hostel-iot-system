export function getTempStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };
  if (value >= 22 && value <= 30) return { label: "Good", type: "good" };
  if ((value > 30 && value <= 34) || (value >= 18 && value < 22)) {
    return { label: "Moderate", type: "warn" };
  }
  return { label: "High", type: "danger" };
}

export function getHumidityStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };
  if (value >= 40 && value <= 70) return { label: "Good", type: "good" };
  if ((value > 70 && value <= 80) || (value >= 30 && value < 40)) {
    return { label: "Moderate", type: "warn" };
  }
  return { label: "High", type: "danger" };
}

export function getAirStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };
  if (value <= 1.5) return { label: "Good", type: "good" };
  if (value <= 3) return { label: "Moderate", type: "warn" };
  return { label: "Poor", type: "danger" };
}

export function getPowerStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };
  if (value <= 100) return { label: "Low", type: "good" };
  if (value <= 250) return { label: "Moderate", type: "warn" };
  return { label: "High", type: "danger" };
}

export function calculateHealthScore({ temperature, humidity, mq135Voltage, power }) {
  let score = 100;

  if (Number.isNaN(temperature) || temperature < 22 || temperature > 30) score -= 20;
  if (Number.isNaN(humidity) || humidity < 40 || humidity > 70) score -= 20;
  if (Number.isNaN(mq135Voltage) || mq135Voltage > 3) score -= 30;
  if (Number.isNaN(power) || power > 250) score -= 15;

  return Math.max(0, score);
}

export function buildAlerts(latest) {
  const alerts = [];

  if (Number(latest.temperature) > 34) {
    alerts.push({
      title: "High Temperature",
      desc: `Temperature is ${latest.temperature}°C`,
    });
  }

  if (Number(latest.humidity) > 80) {
    alerts.push({
      title: "High Humidity",
      desc: `Humidity is ${latest.humidity}%`,
    });
  }

  if (Number(latest.mq135Voltage) > 3) {
    alerts.push({
      title: "Poor Air Quality",
      desc: `MQ135 voltage is ${latest.mq135Voltage}V`,
    });
  }

  if ((latest.pir === 0 || latest.pir === false) && Number(latest.power) > 120) {
    alerts.push({
      title: "Energy Waste",
      desc: "Power is high while room is empty",
    });
  }

  return alerts;
}

export function normalize(value, min, max) {
  if (Number.isNaN(value)) return 0;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(normalized, 100));
}

export function riskFromStatus(type) {
  if (type === "good") return 28;
  if (type === "warn") return 62;
  return 90;
}