const success = "#0C5132"; // ✅ Green (success)
const caution = "#FFAA33"; // 🟠 Orange (caution)
const critical = "#B53A24"; // 🔴 Red (critical)

export function getToneFromSpeedIndex(speedIndexInSeconds) {
  const parsedValue = parseMetricValue(speedIndexInSeconds);
  if (parsedValue < 1.8) return success;
  if (parsedValue <= 3.4) return caution;
  return critical;
}

export function getToneFromFCP(fcpInSeconds) {
  const parsedValue = parseMetricValue(fcpInSeconds);
  if (parsedValue < 1.8) return success;
  if (parsedValue <= 3.0) return caution;
  return critical;
}

export function getToneFromLCP(lcpInSeconds) {
  const parsedValue = parseMetricValue(lcpInSeconds);
  if (parsedValue < 2.5) return success;
  if (parsedValue <= 4.0) return caution;
  return critical;
}

export function getToneFromTBT(tbtInMilliseconds) {
  const parsedValue = parseMetricValue(tbtInMilliseconds);
  if (parsedValue < 200) return success;
  if (parsedValue <= 600) return caution;
  return critical;
}

export function getToneFromCLS(clsValue) {
  const parsedValue = parseMetricValue(clsValue);
  if (parsedValue < 0.1) return success;
  if (parsedValue <= 0.25) return caution;
  return critical;
}

export function getColorFromScore(score) {
  if (score >= 90) return success;
  if (score >= 50) return caution;
  return critical;
}

function parseMetricValue(value) {
  if (typeof value === "string") {
    return parseFloat(value.replace(/[^\d.]/g, "")); // remove "s", "ms", and spaces
  }
  return value;
}
