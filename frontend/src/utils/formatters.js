export function formatEventDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventTime(timeValue) {
  return new Date(`1970-01-01T${timeValue}:00`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(dateValue, timeValue) {
  return `${formatEventDate(dateValue)} at ${formatEventTime(timeValue)}`;
}
