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
// Based on indoor thermal comfort ranges adapted from ASHRAE Standard 55
export function getTempStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };

  if (value >= 22 && value <= 26) {
    return { label: "Normal", type: "good" };
  }

  if ((value > 26 && value <= 30) || (value >= 18 && value < 22)) {
    return { label: "Moderate", type: "warn" };
  }

  return { label: "Critical", type: "danger" };
}

// ================= HUMIDITY =================
// EPA recommends indoor humidity around 30%–50%.
// Values above 60% increase mold risk.
export function getHumidityStatus(value) {
  if (Number.isNaN(value)) return { label: "No Data", type: "warn" };

  if (value >= 30 && value <= 50) {
    return { label: "Normal", type: "good" };
  }

  if ((value > 50 && value <= 60) || (value >= 25 && value < 30)) {
    return { label: "Moderate", type: "warn" };
  }

  return { label: "Critical", type: "danger" };
}

// ================= AIR QUALITY =================
// MQ135 PPM is approximate. These are practical IAQ dashboard thresholds.
// If your value represents CO2-equivalent ppm, 1000 ppm is commonly used as a warning level.
export function getAirStatus(ppm) {
  if (Number.isNaN(ppm)) return { label: "No Data", type: "warn" };

  if (ppm <= 800) return { label: "Good", type: "good" };
  if (ppm <= 1000) return { label: "Moderate", type: "warn" };

  return { label: "Poor", type: "danger" };
}

// ================= DUST / PM =================
// Based on WHO air-quality guidance, adapted for simple dashboard categories.
export function getDustStatus(dustUgM3) {
  if (Number.isNaN(dustUgM3)) return { label: "No Data", type: "warn" };

  if (dustUgM3 <= 15) return { label: "Good", type: "good" };
  if (dustUgM3 <= 50) return { label: "Moderate", type: "warn" };

  return { label: "Unhealthy", type: "danger" };
}

// ================= POWER =================
// Project-specific threshold.
// No universal standard for hostel room power usage.
export function getPowerStatus(powerW) {
  if (Number.isNaN(powerW)) return { label: "No Data", type: "warn" };

  if (powerW <= 100) return { label: "Low", type: "good" };
  if (powerW <= 250) return { label: "Moderate", type: "warn" };

  return { label: "High", type: "danger" };
}

// ================= HEALTH SCORE =================
export function calculateHealthScore({
  temperature,
  humidity,
  air_quality_ppm,
  dust_density_ug_m3,
  power,
}) {
  let score = 100;

  if (Number.isNaN(temperature) || temperature < 22 || temperature > 26) {
    score -= 20;
  }

  if (Number.isNaN(humidity) || humidity < 30 || humidity > 50) {
    score -= 20;
  }

  if (Number.isNaN(air_quality_ppm) || air_quality_ppm > 1000) {
    score -= 25;
  }

  if (Number.isNaN(dust_density_ug_m3) || dust_density_ug_m3 > 50) {
    score -= 25;
  }

  if (Number.isNaN(power) || power > 250) {
    score -= 10;
  }

  return Math.max(0, score);
}

// ================= ALERTS =================
export function buildAlerts(latest) {
  const alerts = [];

  const powerW =
    latest.power !== undefined && latest.power !== null
      ? Number(latest.power)
      : Number(latest.current || 0) * 12;

  if (Number(latest.temperature) > 30) {
    alerts.push({
      title: "High Temperature",
      desc: `Temperature is ${latest.temperature}°C`,
    });
  }

  if (Number(latest.humidity) > 60) {
    alerts.push({
      title: "High Humidity",
      desc: `Humidity is ${latest.humidity}%`,
    });
  }

  if (Number(latest.air_quality_ppm) > 1000) {
    alerts.push({
      title: "Poor Air Quality",
      desc: `Air Quality is ${latest.air_quality_ppm} PPM`,
    });
  }

  if (Number(latest.dust_density_ug_m3) > 50) {
    alerts.push({
      title: "High Dust Level",
      desc: `Dust level is ${latest.dust_density_ug_m3} µg/m³`,
    });
  }

  if (
    (latest.pir === 0 ||
      latest.pir === false ||
      latest.occupancy === "Not Occupied") &&
    powerW > 120
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