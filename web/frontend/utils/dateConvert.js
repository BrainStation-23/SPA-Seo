export function formatReadableDates(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };

  const createdAt = new Date(date).toLocaleString("en-US", options);
  return createdAt;
}
