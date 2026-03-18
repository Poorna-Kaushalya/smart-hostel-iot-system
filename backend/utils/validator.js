function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function validateSensorData(data) {
  if (!data.roomId || typeof data.roomId !== "string") return false;
  if (!isNumber(data.temperature)) return false;
  if (!isNumber(data.humidity)) return false;
  if (!isNumber(data.mq135Voltage)) return false;
  if (!isNumber(data.pir)) return false;
  if (!isNumber(data.ldr)) return false;
  if (!isNumber(data.current)) return false;
  if (!isNumber(data.power)) return false;
  return true;
}

module.exports = { validateSensorData };