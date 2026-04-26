// ================= STATUS COLORS =================
export function statusColor(type) {
  if (type === "good") return "text-emerald-600";
  if (type === "warn") return "text-amber-500";
  return "text-red-500";
}

// ================= ML-BASED STATUS =================
export function getMLStatus(score) {
  if (score >= 80) return { label: "Healthy", type: "good" };
  if (score >= 50) return { label: "Moderate", type: "warn" };
  return { label: "Unhealthy", type: "danger" };
}

// ================= TEMPERATURE =================
export function getTempStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };

  if (value >= 22 && value <= 30) {
    return { label: "Normal", type: "good" };
  }

  if ((value > 30 && value <= 34) || (value >= 18 && value < 22)) {
    return { label: "Moderate", type: "warn" };
  }

  return { label: "Critical", type: "danger" };
}

// ================= HUMIDITY =================
export function getHumidityStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };

  if (value >= 40 && value <= 70) {
    return { label: "Normal", type: "good" };
  }

  if ((value > 70 && value <= 80) || (value >= 30 && value < 40)) {
    return { label: "Moderate", type: "warn" };
  }

  return { label: "Critical", type: "danger" };
}

// ================= AIR QUALITY =================
// Use PPM instead of MQ135 voltage
export function getAirStatus(ppm) {
  if (Number.isNaN(ppm)) return { label: "No Data", type: "warn" };

  if (ppm <= 150) return { label: "Good", type: "good" };
  if (ppm <= 300) return { label: "Moderate", type: "warn" };

  return { label: "Poor", type: "danger" };
}

// ================= POWER =================
// Power is displayed in Watts
export function getPowerStatus(powerW) {
  if (Number.isNaN(powerW)) return { label: "No Data", type: "warn" };

  if (powerW <= 100) return { label: "Low", type: "good" };
  if (powerW <= 250) return { label: "Moderate", type: "warn" };

  return { label: "High", type: "danger" };
}

// ================= OPTIONAL RULE-BASED SCORE =================
// ML score is used in dashboard. This is kept only as fallback.
export function calculateHealthScore({
  temperature,
  humidity,
  air_quality_ppm,
  power,
}) {
  let score = 100;

  if (Number.isNaN(temperature) || temperature < 22 || temperature > 30) {
    score -= 20;
  }

  if (Number.isNaN(humidity) || humidity < 40 || humidity > 70) {
    score -= 20;
  }

  if (Number.isNaN(air_quality_ppm) || air_quality_ppm > 300) {
    score -= 30;
  }

  if (Number.isNaN(power) || power > 250) {
    score -= 15;
  }

  return Math.max(0, score);
}

// ================= ALERTS =================
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

  if (Number(latest.air_quality_ppm) > 300) {
    alerts.push({
      title: "Poor Air Quality",
      desc: `Air Quality is ${latest.air_quality_ppm} PPM`,
    });
  }

  if (
    (latest.pir === 0 || latest.pir === false || latest.occupancy === "Not Occupied") &&
    Number(latest.power) > 120
  ) {
    alerts.push({
      title: "Energy Waste",
      desc: "Power is high while room is empty",
    });
  }

  return alerts;
}

// ================= NORMALIZATION =================
export function normalize(value, min, max) {
  if (Number.isNaN(value)) return 0;

  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(normalized, 100));
}

// ================= RISK =================
export function riskFromStatus(type) {
  if (type === "good") return 28;
  if (type === "warn") return 62;
  return 90;
}