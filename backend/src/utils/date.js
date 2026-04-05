function nowUtc() {
  return new Date();
}

function parseEventDateTime(dateValue, timeValue) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);

  if (!dateMatch || !timeMatch) {
    throw new Error("Use date format YYYY-MM-DD and time format HH:MM");
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day ||
    parsed.getUTCHours() !== hour ||
    parsed.getUTCMinutes() !== minute
  ) {
    throw new Error("Use date format YYYY-MM-DD and time format HH:MM");
  }

  return parsed;
}

module.exports = {
  nowUtc,
  parseEventDateTime,
};
